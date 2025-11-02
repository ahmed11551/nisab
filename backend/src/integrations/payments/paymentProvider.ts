import { BINDetector } from './binDetector'
import { YooKassaPayment } from './yookassa'
import { CloudPaymentsPayment } from './cloudpayments'
import { config } from '../../config'
import { logger } from '../../utils/logger'

export interface PaymentInitData {
  amount: { value: number; currency: string }
  description: string
  metadata?: Record<string, any>
  returnUrl?: string
}

export interface PaymentResult {
  paymentUrl: string
  paymentId: string
  expiresAt: Date
  provider: 'yookassa' | 'cloudpayments'
}

export interface PaymentStatus {
  status: 'pending' | 'succeeded' | 'canceled' | 'failed'
  amount?: number
  currency?: string
  capturedAt?: Date
}

export type PaymentProviderType = 'yookassa' | 'cloudpayments' | 'auto'

export class PaymentProvider {
  /**
   * Выбирает платежный провайдер на основе BIN карты или явного указания
   */
  static selectProvider(
    requestedProvider: PaymentProviderType = 'auto',
    cardBIN?: string
  ): 'yookassa' | 'cloudpayments' {
    if (requestedProvider !== 'auto') {
      return requestedProvider
    }

    // Автоматический выбор на основе BIN
    if (cardBIN) {
      const isRussian = BINDetector.isRussianCard(cardBIN)
      return isRussian ? 'yookassa' : 'cloudpayments'
    }

    // По умолчанию для RUB - YooKassa, для других валют - CloudPayments
    // В реальности нужно получать BIN от пользователя или при первой попытке оплаты
    logger.warn('No BIN provided, defaulting to YooKassa for RUB')
    return 'yookassa'
  }

  /**
   * Создает платеж через выбранного провайдера
   */
  static async createPayment(
    provider: 'yookassa' | 'cloudpayments',
    data: PaymentInitData
  ): Promise<PaymentResult> {
    try {
      if (provider === 'yookassa') {
        const yookassa = new YooKassaPayment(
          config.payments.yookassa.shopId,
          config.payments.yookassa.secretKey
        )
        return await yookassa.createPayment(data)
      } else {
        const cloudpayments = new CloudPaymentsPayment(
          config.payments.cloudpayments.publicId,
          config.payments.cloudpayments.secretKey
        )
        return await cloudpayments.createPayment(data)
      }
    } catch (error) {
      logger.error(`Payment creation failed for ${provider}:`, error)
      throw error
    }
  }

  /**
   * Получает статус платежа
   */
  static async getPaymentStatus(
    provider: 'yookassa' | 'cloudpayments',
    paymentId: string
  ): Promise<PaymentStatus> {
    try {
      if (provider === 'yookassa') {
        const yookassa = new YooKassaPayment(
          config.payments.yookassa.shopId,
          config.payments.yookassa.secretKey
        )
        return await yookassa.getPaymentStatus(paymentId)
      } else {
        const cloudpayments = new CloudPaymentsPayment(
          config.payments.cloudpayments.publicId,
          config.payments.cloudpayments.secretKey
        )
        return await cloudpayments.getPaymentStatus(paymentId)
      }
    } catch (error) {
      logger.error(`Failed to get payment status for ${provider}:`, error)
      throw error
    }
  }
}

