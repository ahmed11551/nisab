import { Router } from 'express'
import { authenticateTelegram } from '../middleware/auth'
import { campaignsController } from '../controllers/campaigns'
import { adminMiddleware } from '../middleware/admin'
import { rateLimiters } from '../middleware/rateLimit'

export const campaignsRoutes = Router()

// Публичные эндпоинты
campaignsRoutes.get('/', authenticateTelegram, campaignsController.list)
campaignsRoutes.get('/:id', authenticateTelegram, campaignsController.get)
campaignsRoutes.get('/:id/report', authenticateTelegram, campaignsController.getReport)

// Создание кампании с лимитом (10 req/hour)
campaignsRoutes.post('/', rateLimiters.campaignCreate, authenticateTelegram, campaignsController.create)

// Пожертвование в кампанию (требует аутентификации)
campaignsRoutes.post('/:id/donate', authenticateTelegram, campaignsController.donate)

// Админ функции (модерация)
campaignsRoutes.patch('/:id/status', authenticateTelegram, adminMiddleware, campaignsController.moderate)
