import { Request, Response, NextFunction } from 'express'
import { subscriptionsService } from '../services/subscriptions'
import { AppError } from '../middleware/errorHandler'

class SubscriptionsController {
  async init(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const result = await subscriptionsService.initSubscription({
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { action } = req.body

      const result = await subscriptionsService.updateSubscription(id, action)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const subscriptions = await subscriptionsService.getUserSubscriptions(userId)

      res.json({
        success: true,
        data: subscriptions,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const subscriptionsController = new SubscriptionsController()

