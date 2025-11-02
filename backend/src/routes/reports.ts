import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { adminMiddleware } from '../middleware/admin'
import { reportsController } from '../controllers/reports'

export const reportsRoutes = Router()

// Публичные эндпоинты
reportsRoutes.get('/funds', authenticateTelegram, reportsController.getFundReports)
reportsRoutes.get('/summary', authenticateTelegram, reportsController.getSummary)
reportsRoutes.get('/:id', authenticateTelegram, reportsController.getReport)

// Админ эндпоинты
reportsRoutes.post('/', authenticateTelegram, adminMiddleware, reportsController.createReport)
reportsRoutes.patch('/:id/verify', authenticateTelegram, adminMiddleware, reportsController.verifyReport)

