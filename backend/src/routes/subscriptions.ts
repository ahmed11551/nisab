import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { subscriptionsController } from '../controllers/subscriptions'
import { rateLimiters } from '../middleware/rateLimit'

export const subscriptionsRoutes = Router()

// Лимит для подписок (5 req/min)
subscriptionsRoutes.post('/init', rateLimiters.subscription, authenticateTelegram, subscriptionsController.init)
subscriptionsRoutes.patch('/:id', authenticateTelegram, subscriptionsController.update)
subscriptionsRoutes.get('/', authenticateTelegram, subscriptionsController.list)

