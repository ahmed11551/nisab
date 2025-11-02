import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { subscriptionsController } from '../controllers/subscriptions'

export const subscriptionsRoutes = Router()

subscriptionsRoutes.post('/init', authenticateTelegram, subscriptionsController.init)
subscriptionsRoutes.patch('/:id', authenticateTelegram, subscriptionsController.update)
subscriptionsRoutes.get('/', authenticateTelegram, subscriptionsController.list)

