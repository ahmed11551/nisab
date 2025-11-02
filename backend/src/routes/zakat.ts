import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { zakatController } from '../controllers/zakat'

export const zakatRoutes = Router()

zakatRoutes.post('/calc', authenticateTelegram, zakatController.calculate)
zakatRoutes.post('/pay', authenticateTelegram, zakatController.pay)

