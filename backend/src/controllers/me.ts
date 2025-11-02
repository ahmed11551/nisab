import { Request, Response, NextFunction } from 'express'
import { meService } from '../services/me'
import { AppError } from '../middleware/errorHandler'

class MeController {
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const { type, period, from = 0, size = 20 } = req.query

      const history = await meService.getHistory({
        userId,
        type: type as string,
        period: period as string,
        from: parseInt(from as string, 10),
        size: parseInt(size as string, 10),
      })

      res.json({
        success: true,
        data: history,
      })
    } catch (error) {
      next(error)
    }
  }

  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const subscriptions = await meService.getSubscriptions(userId)

      res.json({
        success: true,
        data: subscriptions,
      })
    } catch (error) {
      next(error)
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const receipt = await meService.getReceipt(id, userId)

      res.setHeader('Content-Type', 'application/pdf')
      res.send(receipt)
    } catch (error) {
      next(error)
    }
  }
}

export const meController = new MeController()

