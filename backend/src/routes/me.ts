import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { meController } from '../controllers/me'

export const meRoutes = Router()

meRoutes.get('/history', authenticateTelegram, meController.getHistory)
meRoutes.get('/subscriptions', authenticateTelegram, meController.getSubscriptions)
meRoutes.get('/receipts/:id.pdf', authenticateTelegram, meController.getReceipt)

