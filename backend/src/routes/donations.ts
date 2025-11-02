import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { donationsController } from '../controllers/donations'

export const donationsRoutes = Router()

donationsRoutes.post('/init', authenticateTelegram, donationsController.init)
donationsRoutes.get('/:id/status', authenticateTelegram, donationsController.getStatus)

