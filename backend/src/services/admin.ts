import { PartnerApplication } from '../database/models/PartnerApplication'
import { Fund } from '../database/models/Fund'
import { Campaign } from '../database/models/Campaign'

class AdminService {
  async getApplications(status?: string) {
    const where: any = {}
    if (status) {
      where.status = status
    }

    return await PartnerApplication.findAll({
      where,
      order: [['created_at', 'DESC']],
    })
  }

  async updateApplication(id: string, data: { status: string; comment?: string }) {
    const application = await PartnerApplication.findByPk(id)
    if (!application) {
      throw new Error('Application not found')
    }

    application.status = data.status as any
    application.comment = data.comment
    application.reviewed_at = new Date()
    await application.save()

    // If approved, create/update fund
    if (data.status === 'approved') {
      await Fund.create({
        name: application.org_name,
        country_code: application.country_code,
        categories: application.categories,
        website: application.website,
        partner_enabled: true,
        verified: true,
        active: true,
      })
    }

    return application
  }

  async updateFund(id: string, data: Partial<Fund>) {
    const fund = await Fund.findByPk(id)
    if (!fund) {
      throw new Error('Fund not found')
    }

    await fund.update(data)
    return fund
  }

  async updateCampaignStatus(id: string, status: string) {
    const campaign = await Campaign.findByPk(id)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    campaign.status = status as any
    await campaign.save()

    return campaign
  }
}

export const adminService = new AdminService()

