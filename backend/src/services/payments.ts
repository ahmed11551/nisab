import { Donation } from '../database/models/Donation'
import { Subscription } from '../database/models/Subscription'
import { User } from '../database/models/User'
import { Fund } from '../database/models/Fund'
import { PaymentProvider } from '../integrations/payments'
import { config } from '../config'
import { logger } from '../utils/logger'

class PaymentsService {
  /**
   * Обрабатывает webhook от YooKassa
   */
  async processYooKassaWebhook(event: any, signature?: string) {
    try {
      // Валидация подписи (если используется)
      // if (signature && !YooKassaPayment.validateWebhookSignature(...)) {
      //   throw new Error('Invalid signature')
      // }

      const { event: eventType, object: payment } = event

      if (eventType === 'payment.succeeded') {
        await this.handlePaymentSuccess('yookassa', payment.id)
      } else if (eventType === 'payment.canceled') {
        await this.handlePaymentCanceled('yookassa', payment.id)
      } else if (eventType === 'payment.waiting_for_capture') {
        // Оплата ожидает подтверждения
        logger.info('Payment waiting for capture:', payment.id)
      }

      logger.info(`YooKassa webhook processed: ${eventType}`)
    } catch (error) {
      logger.error('Failed to process YooKassa webhook:', error)
      throw error
    }
  }

  /**
   * Обрабатывает webhook от CloudPayments
   */
  async processCloudPaymentsWebhook(event: any, signature?: string) {
    try {
      // Валидация подписи
      if (signature) {
        const { CloudPaymentsPayment } = await import('../integrations/payments/cloudpayments')
        const isValid = CloudPaymentsPayment.validateWebhookSignature(
          event,
          signature,
          config.payments.cloudpayments.secretKey
        )
        if (!isValid) {
          throw new Error('Invalid CloudPayments signature')
        }
      }

      const { TransactionId, Status, Amount, Currency } = event

      if (Status === 'Completed') {
        await this.handlePaymentSuccess('cloudpayments', TransactionId)
      } else if (Status === 'Cancelled') {
        await this.handlePaymentCanceled('cloudpayments', TransactionId)
      } else if (Status === 'Declined') {
        await this.handlePaymentFailed('cloudpayments', TransactionId)
      }

      logger.info(`CloudPayments webhook processed: ${Status}`)
    } catch (error) {
      logger.error('Failed to process CloudPayments webhook:', error)
      throw error
    }
  }

  /**
   * Обрабатывает успешный платеж
   */
  private async handlePaymentSuccess(
    provider: 'yookassa' | 'cloudpayments',
    paymentId: string
  ) {
    // Ищем пожертвование по ID платежа провайдера
    const donation = await Donation.findOne({
      where: {
        provider_payment_id: paymentId,
        provider,
      },
    })

    if (donation) {
      donation.status = 'paid'
      donation.paid_at = new Date()
      
      // Получаем информацию о платеже от провайдера
      try {
        const paymentStatus = await PaymentProvider.getPaymentStatus(
          provider,
          paymentId
        )
        
        // Обновляем receipt_url если есть
        // donation.receipt_url = paymentStatus.receiptUrl
      } catch (error) {
        logger.warn('Failed to get payment details:', error)
      }

      await donation.save()

      logger.info(`Donation ${donation.id} marked as paid`)
      
      // Обновляем баланс кампании если есть
      if (donation.campaign_id) {
        const { Campaign } = await import('../database/models/Campaign')
        const campaign = await Campaign.findByPk(donation.campaign_id)
        if (campaign) {
          campaign.collected_amount = Number(campaign.collected_amount) + Number(donation.amount_value)
          
          // Если цель достигнута, меняем статус
          if (Number(campaign.collected_amount) >= Number(campaign.goal_amount) && campaign.status === 'active') {
            campaign.status = 'completed'
            logger.info(`Campaign ${campaign.id} goal reached`)
          }
          
          await campaign.save()
        }
      }
      
      // Отправляем уведомление пользователю через Telegram Bot
      try {
        const { telegramBot } = await import('../integrations/telegram/bot')
        const user = await User.findByPk(donation.user_id)
        if (user && user.tg_id) {
          const fund = donation.fund_id ? await Fund.findByPk(donation.fund_id) : null
          await telegramBot.notifyDonationSuccess(user.tg_id, {
            id: donation.id,
            amount: Number(donation.amount_value),
            currency: donation.currency,
            fund_name: fund?.name,
          })
        }
      } catch (error) {
        logger.warn('Failed to send Telegram notification:', error)
      }
    } else {
      // Проверяем подписки
      const subscription = await Subscription.findOne({
        where: {
          provider_subscription_id: paymentId,
          provider,
        },
      })

      if (subscription) {
        logger.info(`Subscription ${subscription.id} payment succeeded`)
        
        // Обновляем next_charge_at
        const months = subscription.period === 'P1M' ? 1 : subscription.period === 'P3M' ? 3 : subscription.period === 'P6M' ? 6 : 12
        const nextDate = new Date()
        nextDate.setMonth(nextDate.getMonth() + months)
        subscription.next_charge_at = nextDate
        await subscription.save()
        
        // Создаем отчисление в благотворительность (для Pro/Premium)
        const { subscriptionsService } = await import('./subscriptions')
        try {
          const paymentStatus = await PaymentProvider.getPaymentStatus(provider, paymentId)
          if (paymentStatus.amount) {
            await subscriptionsService.createCharityDonation(subscription.id, paymentStatus.amount)
          }
        } catch (error) {
          logger.warn('Failed to create charity donation:', error)
        }
        
        // Отправляем уведомление пользователю
        try {
          const { telegramBot } = await import('../integrations/telegram/bot')
          const user = await User.findByPk(subscription.user_id)
          if (user && user.tg_id) {
            await telegramBot.notifySubscriptionSuccess(user.tg_id, {
              id: subscription.id,
              plan: subscription.plan,
              period: subscription.period,
              next_charge_at: subscription.next_charge_at || new Date(),
            })
          }
        } catch (error) {
          logger.warn('Failed to send Telegram notification:', error)
        }
      } else {
        logger.warn(`Payment ${paymentId} not found in donations or subscriptions`)
      }
    }
  }

  /**
   * Обрабатывает отмененный платеж
   */
  private async handlePaymentCanceled(
    provider: 'yookassa' | 'cloudpayments',
    paymentId: string
  ) {
    const donation = await Donation.findOne({
      where: {
        provider_payment_id: paymentId,
        provider,
      },
    })

    if (donation) {
      donation.status = 'canceled'
      await donation.save()
      logger.info(`Donation ${donation.id} marked as canceled`)
    }
  }

  /**
   * Обрабатывает неудачный платеж
   */
  private async handlePaymentFailed(
    provider: 'yookassa' | 'cloudpayments',
    paymentId: string
  ) {
    const donation = await Donation.findOne({
      where: {
        provider_payment_id: paymentId,
        provider,
      },
    })

    if (donation) {
      donation.status = 'failed'
      await donation.save()
      logger.info(`Donation ${donation.id} marked as failed`)
    }
  }
}

export const paymentsService = new PaymentsService()
