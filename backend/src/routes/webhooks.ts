import { Router, Request, RequestHandler } from 'express'
import { paymentsController } from '../controllers/payments'

export const webhooksRoutes = Router()

// Middleware для сохранения raw body (нужно для проверки подписи)
const rawBodySaver: RequestHandler = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    (req as any).rawBody = buf.toString(encoding || 'utf8')
  }
}

// YooKassa webhook
webhooksRoutes.post(
  '/yookassa',
  (req, res, next) => {
    req.setEncoding('utf8')
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      (req as any).rawBody = body
      try {
        req.body = JSON.parse(body)
        next()
      } catch (e) {
        next()
      }
    })
  },
  paymentsController.yookassaWebhook
)

// CloudPayments webhook
webhooksRoutes.post(
  '/cloudpayments',
  paymentsController.cloudpaymentsWebhook
)

