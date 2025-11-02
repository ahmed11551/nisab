import { ZakatCalc } from '../database/models/ZakatCalc'
import { User } from '../database/models/User'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

class ZakatService {
  async calculateZakat(data: {
    userId: number
    assets: {
      cash_total: number
      gold_g: number
      silver_g: number
      business_goods_value: number
      investments: number
      receivables_collectible: number
    }
    debts_short_term: number
    nisab_currency: string
    nisab_value: number
    rate_percent?: number
  }) {
    logger.info('Calculating zakat', data)

    // Find or create user
    const user = await User.findOrCreate({
      where: { tg_id: data.userId },
      defaults: {
        tg_id: data.userId,
        first_name: 'User',
      },
    })

    // Calculate total assets
    // Актуальные цены (примерно): золото ~10,700 руб/г, серебро ~150 руб/г (2025)
    // Используем конвертацию: золото берем из нисаба (85г = 914,738 руб), серебро (595г ≈ 89,250 руб)
    const goldPricePerGram = data.nisab_value / 85 // Примерно 10,700 руб/г для нисаба 914,738
    const silverPricePerGram = data.nisab_value / 85 / 7 // Примерно 1,530 руб/г (соотношение золото/серебро ≈7:1)
    
    // Если нисаб рассчитан по серебру, используем другую формулу
    const goldValue = data.assets.gold_g * (goldPricePerGram || 10700) // Более точная цена
    const silverValue = data.assets.silver_g * (silverPricePerGram || 1530) // Более точная цена
    const totalAssets =
      data.assets.cash_total +
      goldValue +
      silverValue +
      data.assets.business_goods_value +
      data.assets.investments +
      data.assets.receivables_collectible

    const netWorth = totalAssets - data.debts_short_term
    const rate = data.rate_percent || 2.5
    const aboveNisab = netWorth >= data.nisab_value
    
    // Правильная формула закята: 2.5% от всего богатства, если оно >= нисаб
    // Если богатство < нисаб, закят = 0
    const zakatDue = aboveNisab ? (netWorth * rate) / 100 : 0

    const calculation = await ZakatCalc.create({
      user_id: user[0].id,
      payload_json: data,
      zakat_due: Math.round(zakatDue),
      above_nisab: aboveNisab,
      nisab_value: data.nisab_value,
      nisab_currency: data.nisab_currency,
    })

    return {
      calculation_id: calculation.id,
      zakat_due: Math.round(zakatDue),
      above_nisab: aboveNisab,
    }
  }

  async payZakat(data: {
    userId: number
    calculation_id: string
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) {
    logger.info('Paying zakat', data)

    // Находим расчет закята
    const calculation = await ZakatCalc.findByPk(data.calculation_id)
    if (!calculation) {
      throw new AppError('Zakat calculation not found', 404)
    }

    // Проверяем, что расчет принадлежит пользователю
    const user = await User.findOne({ where: { tg_id: data.userId } })
    if (!user || calculation.user_id !== user.id) {
      throw new AppError('Unauthorized', 403)
    }

    // Проверяем сумму
    if (data.amount.value !== Number(calculation.zakat_due)) {
      throw new AppError('Amount does not match calculated zakat', 400)
    }

    // Определяем провайдера
    let provider: 'yookassa' | 'cloudpayments'
    if (data.payment_channel && data.payment_channel !== 'auto') {
      provider = data.payment_channel
    } else if (data.card_bin) {
      provider = PaymentProvider.selectProvider('auto', data.card_bin)
    } else {
      provider = data.amount.currency === 'RUB' ? 'yookassa' : 'cloudpayments'
    }

    // Импортируем Donation модель
    const { Donation } = await import('../database/models/Donation')

    // Создаем пожертвование с purpose='zakat'
    const donation = await Donation.create({
      user_id: user.id,
      purpose: 'zakat',
      amount_value: data.amount.value,
      currency: data.amount.currency,
      provider,
      status: 'created',
    })

    try {
      // Инициализируем платеж
      const { PaymentProvider: PP, PaymentInitData } = await import('../integrations/payments')
      const paymentData: PaymentInitData = {
        amount: data.amount,
        description: `Выплата закята`,
        metadata: {
          donation_id: donation.id,
          calculation_id: calculation.id,
          user_id: user.id,
          purpose: 'zakat',
        },
        returnUrl: `https://t.me/your_bot?donation=${donation.id}`,
      }

      const paymentResult = await PP.createPayment(provider, paymentData)

      // Обновляем пожертвование
      donation.provider_payment_id = paymentResult.paymentId
      await donation.save()

      return {
        donation_id: donation.id,
        provider: paymentResult.provider,
        payment_url: paymentResult.paymentUrl,
        expires_at: paymentResult.expiresAt.toISOString(),
      }
    } catch (error: any) {
      logger.error('Zakat payment initialization failed:', error)
      donation.status = 'failed'
      await donation.save()
      throw new AppError(`Payment initialization failed: ${error.message}`, 500)
    }
  }
}

export const zakatService = new ZakatService()

