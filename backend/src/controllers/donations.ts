import { Request, Response, NextFunction } from 'express'
import { donationsService } from '../services/donations'
import { AppError } from '../middleware/errorHandler'

class DonationsController {
  async init(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const result = await donationsService.initDonation({
        userId,
        fund_id: req.body.fund_id,
        purpose: req.body.purpose,
        amount: req.body.amount,
        payment_channel: req.body.payment_channel || 'auto',
        card_bin: req.body.card_bin, // BIN карты для автоматического выбора провайдера
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const status = await donationsService.getDonationStatus(id)

      res.json({
        success: true,
        data: status,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const donationsController = new DonationsController()

