import { Donation } from '../database/models/Donation'
import { Subscription } from '../database/models/Subscription'
import { ZakatCalc } from '../database/models/ZakatCalc'
import { User } from '../database/models/User'
import { Op } from 'sequelize'

class MeService {
  async getHistory(params: {
    userId: number
    type?: 'donation' | 'subscription' | 'zakat' | 'campaign'
    period?: string
    from?: number
    size?: number
  }) {
    const user = await User.findOne({ where: { tg_id: params.userId } })
    if (!user) {
      return { items: [], total: 0 }
    }

    const items = []

    if (!params.type || params.type === 'donation') {
      const { Fund } = await import('../database/models/Fund')
      const donations = await Donation.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: Fund,
            as: 'fund',
            attributes: ['id', 'name', 'logo_url'],
            required: false,
          },
        ],
        limit: params.size || 20,
        offset: params.from || 0,
        order: [['created_at', 'DESC']],
      })
      items.push(...donations.map((d) => ({ ...d.toJSON(), type: 'donation', fund: d.fund })))
    }

    if (!params.type || params.type === 'subscription') {
      const subscriptions = await Subscription.findAll({
        where: { user_id: user.id },
        limit: params.size || 20,
        offset: params.from || 0,
        order: [['created_at', 'DESC']],
      })
      items.push(...subscriptions.map((s) => ({ ...s.toJSON(), type: 'subscription' })))
    }

    if (!params.type || params.type === 'zakat') {
      const zakatCalcs = await ZakatCalc.findAll({
        where: { user_id: user.id },
        limit: params.size || 20,
        offset: params.from || 0,
        order: [['created_at', 'DESC']],
      })
      items.push(...zakatCalcs.map((z) => ({ ...z.toJSON(), type: 'zakat' })))
    }

    // Кампании пользователя (как создатель)
    if (!params.type || params.type === 'campaign') {
      const { Campaign } = await import('../database/models/Campaign')
      const campaigns = await Campaign.findAll({
        where: { owner_id: user.id },
        limit: params.size || 20,
        offset: params.from || 0,
        order: [['created_at', 'DESC']],
      })
      items.push(...campaigns.map((c) => ({ ...c.toJSON(), type: 'campaign' })))
    }

    // Фильтрация по периоду
    let filteredItems = items
    if (params.period) {
      const now = new Date()
      let periodStart: Date

      if (params.period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (params.period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3)
        periodStart = new Date(now.getFullYear(), quarter * 3, 1)
      } else if (params.period === 'year') {
        periodStart = new Date(now.getFullYear(), 0, 1)
      } else {
        periodStart = new Date(0) // Все время
      }

      filteredItems = items.filter((item) => {
        const itemDate = new Date(item.created_at || item.paid_at)
        return itemDate >= periodStart && itemDate <= now
      })
    }

    // Sort by date
    filteredItems.sort((a, b) => new Date(b.created_at || b.paid_at).getTime() - new Date(a.created_at || a.paid_at).getTime())

    return {
      items: filteredItems.slice(params.from || 0, (params.from || 0) + (params.size || 20)),
      total: filteredItems.length,
    }
  }

  async getSubscriptions(userId: number) {
    const user = await User.findOne({ where: { tg_id: userId } })
    if (!user) {
      return []
    }

    return await Subscription.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
    })
  }

  async getReceipt(receiptId: string, userId: number) {
    // TODO: Generate PDF receipt
    const user = await User.findOne({ where: { tg_id: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    // This is a placeholder - implement PDF generation
    return Buffer.from('PDF placeholder')
  }
}

export const meService = new MeService()

