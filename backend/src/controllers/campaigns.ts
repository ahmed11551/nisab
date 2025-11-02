import { Request, Response, NextFunction } from 'express'
import { campaignsService } from '../services/campaigns'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

class CampaignsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, country, category, from = 0, size = 20 } = req.query

      const campaigns = await campaignsService.listCampaigns({
        status: status as string,
        country: country as string,
        category: category as string,
        from: parseInt(from as string, 10),
        size: parseInt(size as string, 10),
      })

      res.json({
        success: true,
        data: campaigns,
      })
    } catch (error) {
      next(error)
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const campaign = await campaignsService.getCampaign(id)

      res.json({
        success: true,
        data: campaign,
      })
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const campaign = await campaignsService.createCampaign({
        ownerId: typeof userId === 'number' ? userId : parseInt(userId, 10),
        ...req.body,
      })

      res.json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully. It will be published after moderation.',
      })
    } catch (error) {
      next(error)
    }
  }

  async donate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.id
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }

      const result = await campaignsService.donateToCampaign({
        campaignId: id,
        userId: typeof userId === 'number' ? userId : parseInt(userId, 10),
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

  /**
   * Модерация кампании (админ)
   */
  async moderate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { action } = req.body // 'approve' or 'reject'
      const adminId = (req as any).user?.id || 'admin'

      if (!action || !['approve', 'reject'].includes(action)) {
        throw new AppError('Invalid action. Use "approve" or "reject"', 400)
      }

      const campaign = await campaignsService.moderateCampaign(id, action, adminId)

      res.json({
        success: true,
        data: campaign,
        message: `Campaign ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Получить отчет по кампании
   */
  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const report = await campaignsService.getCampaignReport(id)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const campaignsController = new CampaignsController()
