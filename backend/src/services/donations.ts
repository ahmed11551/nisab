import { Donation } from '../database/models/Donation'
import { User } from '../database/models/User'
import { Fund } from '../database/models/Fund'
import { logger } from '../utils/logger'
import { PaymentProvider, PaymentInitData } from '../integrations/payments'
import { BINDetector } from '../integrations/payments/binDetector'
import { AppError } from '../middleware/errorHandler'
import { config } from '../config'

class DonationsService {
  async initDonation(data: {
    userId: number
    fund_id: string
    purpose?: string
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) {
    logger.info('Initializing donation', data)

    // Валидация суммы
    if (data.amount.value <= 0) {
      throw new AppError('Invalid amount', 400)
    }

    // Для поддержки проекта (fund_id = 'support') создаем специальный фонд
    let fund: Fund | null = null
    if (data.fund_id === 'support') {
      // Создаем или находим специальный фонд для поддержки проекта
      fund = await Fund.findOrCreate({
        where: { id: '00000000-0000-0000-0000-000000000001', name: 'Поддержка проекта' },
        defaults: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Поддержка проекта',
          country_code: 'RU',
          purposes: ['foundation_needs'],
          categories: ['foundation_needs'],
          verified: true,
          partner_enabled: false,
          short_desc: 'Поддержка развития платформы Nisab',
          active: true,
        },
      }).then(([f]) => f)
    } else {
      // Проверка существования фонда
      fund = await Fund.findByPk(data.fund_id)
      if (!fund || !fund.active) {
        throw new AppError('Fund not found or inactive', 404)
      }
    }

    // Find or create user
    const user = await User.findOrCreate({
      where: { tg_id: data.userId },
      defaults: {
        tg_id: data.userId,
        first_name: 'User',
      },
    })

    // Определяем провайдера платежной системы
    let provider: 'yookassa' | 'cloudpayments'
    
    if (data.payment_channel && data.payment_channel !== 'auto') {
      provider = data.payment_channel
    } else if (data.card_bin) {
      // Извлекаем BIN если передан полный номер карты
      const bin = BINDetector.extractBIN(data.card_bin)
      provider = PaymentProvider.selectProvider('auto', bin)
    } else {
      // По умолчанию: RUB → YooKassa, другие валюты → CloudPayments
      provider = data.amount.currency === 'RUB' ? 'yookassa' : 'cloudpayments'
    }

    // Создаем запись пожертвования
    const donation = await Donation.create({
      user_id: user[0].id,
      fund_id: fund.id,
      purpose: data.purpose || (data.fund_id === 'support' ? 'support' : 'donation'),
      amount_value: data.amount.value,
      currency: data.amount.currency,
      provider,
      status: 'created',
    })

    try {
      // Инициализируем платеж через выбранного провайдера
      const paymentData: PaymentInitData = {
        amount: data.amount,
        description: data.fund_id === 'support'
          ? `Поддержка проекта Nisab`
          : `Пожертвование в фонд "${fund.name}"${data.purpose ? ` (${data.purpose})` : ''}`,
        metadata: {
          donation_id: donation.id,
          user_id: user[0].id,
          fund_id: fund.id,
          purpose: data.purpose || (data.fund_id === 'support' ? 'support' : 'donation'),
        },
        returnUrl: `${config.corsOrigin}/donate/success?donation=${donation.id}`,
      }

      const paymentResult = await PaymentProvider.createPayment(provider, paymentData)

      // Обновляем запись с ID платежа от провайдера
      donation.provider_payment_id = paymentResult.paymentId
      await donation.save()

      return {
        donation_id: donation.id,
        provider: paymentResult.provider,
        payment_url: paymentResult.paymentUrl,
        expires_at: paymentResult.expiresAt.toISOString(),
      }
    } catch (error: any) {
      logger.error('Payment initialization failed:', error)
      // Обновляем статус на failed
      donation.status = 'failed'
      await donation.save()

      throw new AppError(`Payment initialization failed: ${error.message}`, 500)
    }
  }

  async getDonationStatus(donationId: string) {
    const donation = await Donation.findByPk(donationId)
    if (!donation) {
      throw new Error('Donation not found')
    }

    return {
      status: donation.status,
      amount: donation.amount_value,
      currency: donation.currency,
    }
  }
}

export const donationsService = new DonationsService()
