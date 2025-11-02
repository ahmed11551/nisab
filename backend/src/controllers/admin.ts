import { Request, Response, NextFunction } from 'express'
import { adminService } from '../services/admin'

class AdminController {
  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query
      const applications = await adminService.getApplications(status as string)
      res.json({
        success: true,
        data: applications,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { status, comment } = req.body
      const application = await adminService.updateApplication(id, { status, comment })
      res.json({
        success: true,
        data: application,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateFund(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const fund = await adminService.updateFund(id, req.body)
      res.json({
        success: true,
        data: fund,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateCampaignStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { status } = req.body
      const campaign = await adminService.updateCampaignStatus(id, status)
      res.json({
        success: true,
        data: campaign,
      })
    } catch (error) {
      next(error)
    }
  }
}

export const adminController = new AdminController()

