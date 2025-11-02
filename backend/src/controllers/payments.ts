import { Request, Response, NextFunction } from 'express'
import { paymentsService } from '../services/payments'
import { logger } from '../utils/logger'

class PaymentsController {
  async yookassaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // YooKassa отправляет событие в формате JSON
      const event = req.body
      const signature = req.headers['x-request-id'] // Или другой заголовок подписи

      logger.info('YooKassa webhook received:', event)

      await paymentsService.processYooKassaWebhook(event, signature as string)

      // YooKassa ожидает ответ 200 OK
      res.status(200).json({ success: true })
    } catch (error) {
      logger.error('YooKassa webhook error:', error)
      next(error)
    }
  }

  async cloudpaymentsWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body
      const signature = req.headers['content-hmac'] as string

      logger.info('CloudPayments webhook received:', event)

      await paymentsService.processCloudPaymentsWebhook(event, signature)

      res.status(200).json({ success: true })
    } catch (error) {
      logger.error('CloudPayments webhook error:', error)
      next(error)
    }
  }
}

export const paymentsController = new PaymentsController()

