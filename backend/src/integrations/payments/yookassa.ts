import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
import { PaymentInitData, PaymentResult, PaymentStatus } from './paymentProvider'
import { logger } from '../../utils/logger'

export class YooKassaPayment {
  private client: AxiosInstance
  private shopId: string
  private secretKey: string

  constructor(shopId: string, secretKey: string) {
    this.shopId = shopId
    this.secretKey = secretKey

    // Базовая авторизация для YooKassa
    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

    this.client = axios.create({
      baseURL: 'https://api.yookassa.ru/v3',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': '', // Будет установлен в методе
      },
      timeout: 30000,
    })
  }

  /**
   * Создает платеж в YooKassa
   */
  async createPayment(data: PaymentInitData): Promise<PaymentResult> {
    try {
      const idempotenceKey = crypto.randomUUID()

      const paymentData = {
        amount: {
          value: data.amount.value.toFixed(2),
          currency: data.amount.currency,
        },
        confirmation: {
          type: 'redirect',
          return_url: data.returnUrl || 'https://t.me/your_bot',
        },
        description: data.description,
        metadata: data.metadata || {},
        capture: true, // Автоматическое подтверждение
      }

      const response = await this.client.post('/payments', paymentData, {
        headers: {
          'Idempotence-Key': idempotenceKey,
        },
      })

      const payment = response.data

      return {
        paymentUrl: payment.confirmation?.confirmation_url || '',
        paymentId: payment.id,
        expiresAt: payment.expires_at
          ? new Date(payment.expires_at)
          : new Date(Date.now() + 15 * 60 * 1000), // 15 минут по умолчанию
        provider: 'yookassa',
      }
    } catch (error: any) {
      logger.error('YooKassa payment creation error:', error.response?.data || error.message)
      throw new Error(`YooKassa payment failed: ${error.message}`)
    }
  }

  /**
   * Получает статус платежа
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await this.client.get(`/payments/${paymentId}`)
      const payment = response.data

      const statusMap: Record<string, PaymentStatus['status']> = {
        pending: 'pending',
        succeeded: 'succeeded',
        canceled: 'canceled',
      }

      return {
        status: statusMap[payment.status] || 'pending',
        amount: payment.amount?.value ? parseFloat(payment.amount.value) : undefined,
        currency: payment.amount?.currency,
        capturedAt: payment.captured_at ? new Date(payment.captured_at) : undefined,
      }
    } catch (error: any) {
      logger.error('YooKassa get payment status error:', error.response?.data || error.message)
      throw new Error(`Failed to get YooKassa payment status: ${error.message}`)
    }
  }

  /**
   * Валидирует подпись webhook от YooKassa
   */
  static validateWebhookSignature(
    body: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      return hash === signature
    } catch (error) {
      logger.error('Webhook signature validation error:', error)
      return false
    }
  }
}

