import { Router, Request, Response, NextFunction } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { fundsController } from '../controllers/funds'
import { adminMiddleware } from '../middleware/admin'

export const fundsRoutes = Router()

// Публичные эндпоинты
fundsRoutes.get('/', authenticateTelegram, fundsController.list)
fundsRoutes.get('/:id', authenticateTelegram, fundsController.get)

// Админ эндпоинты
fundsRoutes.post('/sync', authenticateTelegram, adminMiddleware, fundsController.sync)
