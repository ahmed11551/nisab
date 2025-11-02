import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { partnersController } from '../controllers/partners'

export const partnersRoutes = Router()

partnersRoutes.get('/countries', partnersController.getCountries)
partnersRoutes.get('/funds', authenticateTelegram, partnersController.getFunds)
partnersRoutes.post('/applications', authenticateTelegram, partnersController.submitApplication)

