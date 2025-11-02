import { Request, Response, NextFunction } from 'express'
import { reportsService } from '../services/reports'
import { AppError } from '../middleware/errorHandler'

class ReportsController {
  /**
   * Получить отчёты фонда
   * GET /api/v1/reports/funds?fund_id=xxx&from=2024-01-01&to=2024-12-31
   */
  async getFundReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { fund_id, from, to, verified } = req.query

      const reports = await reportsService.getFundReports({
        fund_id: fund_id as string,
        from: from as string,
        to: to as string,
        verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
      })

      res.json({
        success: true,
        data: reports,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Получить отчёт по ID
   * GET /api/v1/reports/:id
   */
  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const report = await reportsService.getReport(id)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Получить сводку по проекту
   * GET /api/v1/reports/summary?period=monthly
   */
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, from, to } = req.query

      const summary = await reportsService.getSummary({
        period: period as 'monthly' | 'quarterly' | 'yearly',
        from: from as string,
        to: to as string,
      })

      res.json({
        success: true,
        data: summary,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Создать отчёт (админ)
   * POST /api/v1/reports
   */
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.createReport(req.body)

      res.json({
        success: true,
        data: report,
        message: 'Report created successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Верифицировать отчёт (админ)
   * PATCH /api/v1/reports/:id/verify
   */
  async verifyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const adminId = (req as any).user?.id || 'admin'

      const report = await reportsService.verifyReport(id, adminId)

      res.json({
        success: true,
        data: report,
        message: 'Report verified successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export const reportsController = new ReportsController()

