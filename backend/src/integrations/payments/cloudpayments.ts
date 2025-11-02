import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
import { PaymentInitData, PaymentResult, PaymentStatus } from './paymentProvider'
import { logger } from '../../utils/logger'

export class CloudPaymentsPayment {
  private client: AxiosInstance
  private publicId: string
  private secretKey: string

  constructor(publicId: string, secretKey: string) {
    this.publicId = publicId
    this.secretKey = secretKey

    this.client = axios.create({
      baseURL: 'https://api.cloudpayments.ru',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    })
  }

  /**
   * Создает платеж в CloudPayments
   */
  async createPayment(data: PaymentInitData): Promise<PaymentResult> {
    try {
      // CloudPayments использует другой подход - создание счета
      // Для редиректа на форму оплаты используем Charge
      const invoiceData = {
        Amount: data.amount.value,
        Currency: data.amount.currency,
        Description: data.description,
        InvoiceId: data.metadata?.donation_id || crypto.randomUUID(),
        AccountId: data.metadata?.user_id || 'telegram_user',
        Email: data.metadata?.email || '',
        // Дополнительные параметры
        JsonData: JSON.stringify(data.metadata || {}),
      }

      // CloudPayments может возвращать URL для оплаты через карту
      // В реальности это зависит от типа платежа (charge/charge token)
      // Для MVP используем форму оплаты через редирект

      const paymentId = invoiceData.InvoiceId

      // CloudPayments использует форму оплаты
      // URL формируется на фронтенде или через API
      const paymentUrl = `https://widget.cloudpayments.ru/pay?publicId=${this.publicId}&invoiceId=${paymentId}`

      return {
        paymentUrl,
        paymentId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
        provider: 'cloudpayments',
      }
    } catch (error: any) {
      logger.error('CloudPayments payment creation error:', error.response?.data || error.message)
      throw new Error(`CloudPayments payment failed: ${error.message}`)
    }
  }

  /**
   * Получает статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      // CloudPayments API для проверки статуса
      const response = await this.client.post('/payments/get', {
        TransactionId: paymentId,
        PublicId: this.publicId,
        ApiSecret: this.secretKey,
      })

      const payment = response.data

      const statusMap: Record<string, PaymentStatus['status']> = {
        AwaitingAuthentication: 'pending',
        Completed: 'succeeded',
        Cancelled: 'canceled',
        Declined: 'failed',
      }

      return {
        status: statusMap[payment.Status] || 'pending',
        amount: payment.Amount,
        currency: payment.Currency,
        capturedAt: payment.CreatedDateIso ? new Date(payment.CreatedDateIso) : undefined,
      }
    } catch (error: any) {
      logger.error('CloudPayments get payment status error:', error.response?.data || error.message)
      throw new Error(`Failed to get CloudPayments payment status: ${error.message}`)
    }
  }

  /**
   * Валидирует подпись webhook от CloudPayments
   */
  static validateWebhookSignature(
    body: Record<string, any>,
    signature: string,
    secret: string
  ): boolean {
    try {
      // CloudPayments использует Content-HMAC подпись
      const message = JSON.stringify(body)
      const hash = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('base64')

      return hash === signature
    } catch (error) {
      logger.error('Webhook signature validation error:', error)
      return false
    }
  }
}

