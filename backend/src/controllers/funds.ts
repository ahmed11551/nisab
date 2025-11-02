import { Request, Response, NextFunction } from 'express'
import { fundsService } from '../services/funds'
import { AppError } from '../middleware/errorHandler'

class FundsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { country, purpose, query, from = 0, size = 20 } = req.query

      const funds = await fundsService.listFunds({
        country: country as string,
        purpose: purpose as string,
        query: query as string,
        from: parseInt(from as string, 10),
        size: parseInt(size as string, 10),
      })

      res.json({
        success: true,
        data: funds,
      })
    } catch (error) {
      next(error)
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const fund = await fundsService.getFund(id)

      if (!fund) {
        throw new AppError('Fund not found', 404)
      }

      res.json({
        success: true,
        data: fund,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Синхронизация фондов из EReplika API (админ функция)
   */
  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await fundsService.syncFromEReplika()

      res.json({
        success: true,
        data: result,
        message: `Synced ${result.synced} funds: ${result.created} created, ${result.updated} updated`,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const fundsController = new FundsController()
