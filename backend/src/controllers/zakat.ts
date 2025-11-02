import { Request, Response, NextFunction } from 'express'
import { zakatService } from '../services/zakat'
import { AppError } from '../middleware/errorHandler'

class ZakatController {
  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const result = await zakatService.calculateZakat({
        userId,
        ...req.body,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async pay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const result = await zakatService.payZakat({
        userId,
        ...req.body,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const zakatController = new ZakatController()

