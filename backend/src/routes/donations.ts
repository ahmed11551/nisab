import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { donationsController } from '../controllers/donations'
import { rateLimiters } from '../middleware/rateLimit'

export const donationsRoutes = Router()

// Лимит для инициализации пожертвования (20 req/min)
donationsRoutes.post('/init', rateLimiters.donation, authenticateTelegram, donationsController.init)
donationsRoutes.get('/:id/status', authenticateTelegram, donationsController.getStatus)

