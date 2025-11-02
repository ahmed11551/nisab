import { Report } from '../database/models/Report'
import { Fund } from '../database/models/Fund'
import { Donation } from '../database/models/Donation'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { Op } from 'sequelize'

class ReportsService {
  /**
   * Получить отчёты фонда
   */
  async getFundReports(params: {
    fund_id?: string
    from?: string
    to?: string
    verified?: boolean
  }) {
    const where: any = {}

    if (params.fund_id) {
      where.fund_id = params.fund_id
    }

    if (params.from && params.to) {
      where.period_start = {
        [Op.gte]: new Date(params.from),
      }
      where.period_end = {
        [Op.lte]: new Date(params.to),
      }
    }

    if (params.verified !== undefined) {
      where.verified = params.verified
    }

    const reports = await Report.findAll({
      where,
      include: [
        {
          association: 'fund',
          attributes: ['id', 'name', 'logo_url'],
        },
      ],
      order: [['period_start', 'DESC']],
    })

    return {
      items: reports,
      total: await Report.count({ where }),
    }
  }

  /**
   * Получить отчёт по ID
   */
  async getReport(id: string) {
    const report = await Report.findByPk(id, {
      include: [
        {
          association: 'fund',
          attributes: ['id', 'name', 'logo_url', 'website'],
        },
      ],
    })

    if (!report) {
      throw new AppError('Report not found', 404)
    }

    // Получаем пожертвования за период отчёта
    const donations = await Donation.findAll({
      where: {
        fund_id: report.fund_id,
        status: 'paid',
        paid_at: {
          [Op.between]: [report.period_start, report.period_end],
        },
      },
      order: [['paid_at', 'DESC']],
    })

    return {
      report: report.toJSON(),
      donations: donations.map((d) => ({
        id: d.id,
        amount: Number(d.amount_value),
        currency: d.currency,
        paid_at: d.paid_at,
        receipt_url: d.receipt_url,
      })),
    }
  }

  /**
   * Создать отчёт (админ функция)
   */
  async createReport(data: {
    fund_id: string
    period_start: string
    period_end: string
    file_url?: string
    total_collected?: number
    total_distributed?: number
  }) {
    logger.info('Creating report', data)

    const fund = await Fund.findByPk(data.fund_id)
    if (!fund) {
      throw new AppError('Fund not found', 404)
    }

    // Если суммы не указаны, рассчитываем из пожертвований
    let totalCollected = data.total_collected
    if (!totalCollected) {
      const donations = await Donation.findAll({
        where: {
          fund_id: data.fund_id,
          status: 'paid',
          paid_at: {
            [Op.between]: [new Date(data.period_start), new Date(data.period_end)],
          },
        },
      })

      totalCollected = donations.reduce((sum, d) => sum + Number(d.amount_value), 0)
    }

    const report = await Report.create({
      fund_id: data.fund_id,
      period_start: new Date(data.period_start),
      period_end: new Date(data.period_end),
      file_url: data.file_url,
      total_collected: totalCollected,
      total_distributed: data.total_distributed || 0,
      verified: false,
    })

    return report
  }

  /**
   * Верифицировать отчёт (админ функция)
   */
  async verifyReport(id: string, adminId: string) {
    const report = await Report.findByPk(id)
    if (!report) {
      throw new AppError('Report not found', 404)
    }

    report.verified = true
    await report.save()

    logger.info(`Report ${id} verified by admin ${adminId}`)

    return report
  }

  /**
   * Получить сводку по проекту
   */
  async getSummary(params: {
    period?: 'monthly' | 'quarterly' | 'yearly'
    from?: string
    to?: string
  }) {
    const now = new Date()
    let periodStart: Date
    let periodEnd: Date = now

    if (params.from && params.to) {
      periodStart = new Date(params.from)
      periodEnd = new Date(params.to)
    } else if (params.period === 'monthly') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (params.period === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3)
      periodStart = new Date(now.getFullYear(), quarter * 3, 1)
    } else if (params.period === 'yearly') {
      periodStart = new Date(now.getFullYear(), 0, 1)
    } else {
      // По умолчанию: текущий месяц
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Общая статистика пожертвований
    const totalDonations = await Donation.sum('amount_value', {
      where: {
        status: 'paid',
        paid_at: {
          [Op.between]: [periodStart, periodEnd],
        },
      },
    })

    const donationCount = await Donation.count({
      where: {
        status: 'paid',
        paid_at: {
          [Op.between]: [periodStart, periodEnd],
        },
      },
    })

    // Статистика по подпискам
    const { Subscription } = await import('../database/models/Subscription')
    const activeSubscriptions = await Subscription.count({
      where: {
        status: 'active',
      },
    })

    // Статистика по кампаниям
    const { Campaign } = await import('../database/models/Campaign')
    const activeCampaigns = await Campaign.count({
      where: {
        status: 'active',
      },
    })

    const completedCampaigns = await Campaign.count({
      where: {
        status: 'completed',
        created_at: {
          [Op.between]: [periodStart, periodEnd],
        },
      },
    })

    return {
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      donations: {
        total: Number(totalDonations) || 0,
        count: donationCount,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
      campaigns: {
        active: activeCampaigns,
        completed: completedCampaigns,
      },
    }
  }
}

export const reportsService = new ReportsService()

