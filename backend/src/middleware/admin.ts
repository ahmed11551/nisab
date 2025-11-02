import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'
import { config } from '../config'

/**
 * Middleware для проверки прав администратора
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Проверка через API ключ
  const apiKey = req.headers['x-admin-api-key'] || req.headers['admin-api-key']
  
  if (apiKey && apiKey === config.admin.apiKey) {
    return next()
  }

  // Или проверка через user role (если добавите поле role в User модель)
  const user = (req as any).user
  if (user && user.role === 'admin') {
    return next()
  }

  throw new AppError('Admin access required', 403)
}

