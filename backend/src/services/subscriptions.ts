import { Subscription } from '../database/models/Subscription'
import { User } from '../database/models/User'
import { Fund } from '../database/models/Fund'
import { DerivedAlms } from '../database/models/DerivedAlms'
import { PaymentProvider, PaymentInitData } from '../integrations/payments'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

// Тарифы подписок
const SUBSCRIPTION_PRICES = {
  basic: { P1M: 290, P3M: 870, P6M: 1160, P12M: 2610 },
  pro: { P1M: 590, P3M: 1770, P6M: 2360, P12M: 5310 },
  premium: { P1M: 990, P3M: 2970, P6M: 3960, P12M: 8910 },
}

class SubscriptionsService {
  async initSubscription(data: {
    userId: number
    plan_id: 'basic' | 'pro' | 'premium'
    period: 'P1M' | 'P3M' | 'P6M' | 'P12M'
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) {
    logger.info('Initializing subscription', data)

    // Валидация периода
    if (!['P1M', 'P3M', 'P6M', 'P12M'].includes(data.period)) {
      throw new AppError('Invalid subscription period', 400)
    }

    // Find or create user
    const user = await User.findOrCreate({
      where: { tg_id: data.userId },
      defaults: {
        tg_id: data.userId,
        first_name: 'User',
      },
    })

    // Получаем цену подписки
    const price = SUBSCRIPTION_PRICES[data.plan_id][data.period]
    if (!price) {
      throw new AppError('Invalid plan or period', 400)
    }

    // Определяем провайдера платежной системы
    let provider: 'yookassa' | 'cloudpayments'
    if (data.payment_channel && data.payment_channel !== 'auto') {
      provider = data.payment_channel
    } else if (data.card_bin) {
      provider = PaymentProvider.selectProvider('auto', data.card_bin)
    } else {
      // По умолчанию для RUB - YooKassa
      provider = 'yookassa'
    }

    // Создаем подписку
    const subscription = await Subscription.create({
      user_id: user[0].id,
      plan: data.plan_id,
      period: data.period,
      provider,
      status: 'active',
      next_charge_at: this.calculateNextChargeDate(data.period),
    })

    try {
      // Инициализируем платеж
      const paymentData: PaymentInitData = {
        amount: { value: price, currency: 'RUB' },
        description: `Подписка ${data.plan_id} на ${data.period}`,
        metadata: {
          subscription_id: subscription.id,
          user_id: user[0].id,
          plan: data.plan_id,
          period: data.period,
        },
        returnUrl: `https://t.me/your_bot?subscription=${subscription.id}`,
      }

      const paymentResult = await PaymentProvider.createPayment(provider, paymentData)

      // Обновляем подписку с ID платежа
      subscription.provider_subscription_id = paymentResult.paymentId
      await subscription.save()

      return {
        subscription_id: subscription.id,
        provider: paymentResult.provider,
        confirmation_url: paymentResult.paymentUrl,
        payment_url: paymentResult.paymentUrl,
        expires_at: paymentResult.expiresAt.toISOString(),
      }
    } catch (error: any) {
      logger.error('Payment initialization failed:', error)
      subscription.status = 'canceled'
      await subscription.save()
      throw new AppError(`Payment initialization failed: ${error.message}`, 500)
    }
  }

  async updateSubscription(id: string, action: 'pause' | 'resume' | 'cancel') {
    const subscription = await Subscription.findByPk(id)
    if (!subscription) {
      throw new AppError('Subscription not found', 404)
    }

    const statusMap = {
      pause: 'paused',
      resume: 'active',
      cancel: 'canceled',
    } as const

    subscription.status = statusMap[action] as any

    // Если возобновляем, обновляем next_charge_at
    if (action === 'resume') {
      subscription.next_charge_at = this.calculateNextChargeDate(subscription.period)
    }

    await subscription.save()

    return subscription
  }

  async getUserSubscriptions(userId: number) {
    const user = await User.findOne({ where: { tg_id: userId } })
    if (!user) {
      return []
    }

    return await Subscription.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
    })
  }

  /**
   * Создает отчисление в благотворительность от подписки (для Pro и Premium)
   */
  async createCharityDonation(subscriptionId: string, paymentAmount: number) {
    const subscription = await Subscription.findByPk(subscriptionId)
    if (!subscription) {
      throw new AppError('Subscription not found', 404)
    }

    // Процент отчисления: Pro - 5%, Premium - 10%
    const charityPercent = subscription.plan === 'pro' ? 5 : subscription.plan === 'premium' ? 10 : 0

    if (charityPercent === 0) {
      return null // Базовый план не имеет отчислений
    }

    // Получаем внутренний фонд для отчислений
    const internalFund = await Fund.findOne({
      where: { name: 'Внутренний фонд проекта', active: true },
    })

    if (!internalFund) {
      logger.warn('Internal fund not found, skipping charity donation')
      return null
    }

    const charityAmount = Math.round((paymentAmount * charityPercent) / 100)

    // Создаем запись об отчислении
    const derivedAlms = await DerivedAlms.create({
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      percent: charityPercent,
      amount_value: charityAmount,
      currency: 'RUB',
      fund_id: internalFund.id,
    })

    logger.info(`Created charity donation: ${charityAmount} RUB (${charityPercent}%) from subscription ${subscriptionId}`)

    return derivedAlms
  }

  private calculateNextChargeDate(period: string): Date {
    const months = period === 'P1M' ? 1 : period === 'P3M' ? 3 : period === 'P6M' ? 6 : 12
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date
  }
}

export const subscriptionsService = new SubscriptionsService()

