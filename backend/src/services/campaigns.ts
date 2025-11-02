import { Campaign } from '../database/models/Campaign'
import { User } from '../database/models/User'
import { Donation } from '../database/models/Donation'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../utils/logger'
import { Op } from 'sequelize'

class CampaignsService {
  async listCampaigns(params: {
    status?: string
    country?: string
    category?: string
    from?: number
    size?: number
  }) {
    const where: any = {}
    
    // По умолчанию показываем только активные и одобренные
    if (params.status) {
      where.status = params.status
    } else {
      where.status = { [Op.in]: ['active', 'approved'] }
    }
    
    if (params.country) {
      where.country_code = params.country
    }
    if (params.category) {
      where.category = params.category
    }

    const campaigns = await Campaign.findAll({
      where,
      limit: params.size || 20,
      offset: params.from || 0,
      order: [['created_at', 'DESC']],
      include: [
        {
          association: 'owner',
          attributes: ['id', 'first_name', 'last_name', 'username'],
        },
      ],
    })

    // Подсчитываем количество участников для каждой кампании
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const participantCount = await Donation.count({
          where: {
            campaign_id: campaign.id,
            status: 'paid',
          },
          distinct: true,
          col: 'user_id',
        })

        return {
          ...campaign.toJSON(),
          participant_count: participantCount,
        }
      })
    )

    return {
      items: campaignsWithStats,
      total: await Campaign.count({ where }),
    }
  }

  async getCampaign(id: string) {
    const campaign = await Campaign.findByPk(id, {
      include: [
        { association: 'owner', attributes: ['id', 'first_name', 'last_name', 'username'] },
        { association: 'fund', attributes: ['id', 'name', 'logo_url'] },
      ],
    })
    
    if (!campaign) {
      throw new AppError('Campaign not found', 404)
    }

    // Подсчитываем участников
    const participantCount = await Donation.count({
      where: {
        campaign_id: campaign.id,
        status: 'paid',
      },
      distinct: true,
      col: 'user_id',
    })

    return {
      ...campaign.toJSON(),
      participant_count: participantCount,
    }
  }

  async createCampaign(data: {
    ownerId: number
    title: string
    description: string
    category: string
    goal_amount: number
    country_code?: string
    fund_id?: string
    end_date?: string
    image_url?: string
  }) {
    logger.info('Creating campaign', data)

    // Валидация
    if (data.goal_amount <= 0) {
      throw new AppError('Goal amount must be positive', 400)
    }

    if (!['mosque', 'orphans', 'intl', 'foundation_needs', 'education'].includes(data.category)) {
      throw new AppError('Invalid category', 400)
    }

    const user = await User.findOrCreate({
      where: { tg_id: data.ownerId },
      defaults: {
        tg_id: data.ownerId,
        first_name: 'User',
      },
    })

    const campaign = await Campaign.create({
      owner_id: user[0].id,
      title: data.title,
      description: data.description,
      category: data.category,
      goal_amount: data.goal_amount,
      collected_amount: 0,
      country_code: data.country_code,
      fund_id: data.fund_id,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      image_url: data.image_url,
      status: 'pending', // Новая кампания ожидает модерации
      verified_by_admin: false,
    })

    logger.info(`Campaign ${campaign.id} created, awaiting moderation`)

    return campaign
  }

  async donateToCampaign(data: {
    campaignId: string
    userId: number
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) {
    logger.info('Donating to campaign', data)

    const campaign = await Campaign.findByPk(data.campaignId)
    if (!campaign) {
      throw new AppError('Campaign not found', 404)
    }

    // Проверяем, что кампания активна
    if (campaign.status !== 'active') {
      throw new AppError(`Campaign is not active. Current status: ${campaign.status}`, 400)
    }

    // Проверяем срок окончания
    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      // Автоматически завершаем кампанию по сроку
      campaign.status = 'completed'
      await campaign.save()
      throw new AppError('Campaign has ended', 400)
    }

    // Проверяем, что цель еще не достигнута
    if (Number(campaign.collected_amount) >= Number(campaign.goal_amount)) {
      // Автоматически завершаем кампанию при достижении цели
      campaign.status = 'completed'
      await campaign.save()
      throw new AppError('Campaign goal already reached', 400)
    }

    // Find or create user
    const user = await User.findOrCreate({
      where: { tg_id: data.userId },
      defaults: {
        tg_id: data.userId,
        first_name: 'User',
      },
    })

    // Определяем провайдера
    let provider: 'yookassa' | 'cloudpayments'
    if (data.payment_channel && data.payment_channel !== 'auto') {
      provider = data.payment_channel
    } else if (data.card_bin) {
      const { PaymentProvider: PP } = await import('../integrations/payments')
      provider = PP.selectProvider('auto', data.card_bin)
    } else {
      provider = data.amount.currency === 'RUB' ? 'yookassa' : 'cloudpayments'
    }

    // Создаем пожертвование
    const donation = await Donation.create({
      user_id: user[0].id,
      campaign_id: campaign.id,
      fund_id: campaign.fund_id || undefined,
      purpose: campaign.category,
      amount_value: data.amount.value,
      currency: data.amount.currency,
      provider,
      status: 'created',
    })

    try {
      // Инициализируем платеж
      const { PaymentProvider: PP, PaymentInitData } = await import('../integrations/payments')
      const paymentData: PaymentInitData = {
        amount: data.amount,
        description: `Пожертвование в кампанию: ${campaign.title}`,
        metadata: {
          donation_id: donation.id,
          campaign_id: campaign.id,
          user_id: user[0].id,
        },
        returnUrl: `https://t.me/your_bot?donation=${donation.id}`,
      }

      const paymentResult = await PP.createPayment(provider, paymentData)

      // Обновляем пожертвование
      donation.provider_payment_id = paymentResult.paymentId
      await donation.save()

      return {
        donation_id: donation.id,
        provider: paymentResult.provider,
        payment_url: paymentResult.paymentUrl,
        expires_at: paymentResult.expiresAt.toISOString(),
      }
    } catch (error: any) {
      logger.error('Campaign donation payment failed:', error)
      donation.status = 'failed'
      await donation.save()
      throw new AppError(`Payment initialization failed: ${error.message}`, 500)
    }
  }

  /**
   * Модерация кампании (админ функция)
   */
  async moderateCampaign(campaignId: string, action: 'approve' | 'reject', adminId: string) {
    const campaign = await Campaign.findByPk(campaignId)
    if (!campaign) {
      throw new AppError('Campaign not found', 404)
    }

    if (action === 'approve') {
      campaign.status = 'active'
      campaign.verified_by_admin = true
      logger.info(`Campaign ${campaignId} approved by admin ${adminId}`)
    } else if (action === 'reject') {
      campaign.status = 'rejected'
      logger.info(`Campaign ${campaignId} rejected by admin ${adminId}`)
    } else {
      throw new AppError('Invalid action. Use "approve" or "reject"', 400)
    }

    await campaign.save()
    return campaign
  }

  /**
   * Получить отчет по кампании
   */
  async getCampaignReport(campaignId: string) {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { association: 'owner', attributes: ['id', 'first_name', 'last_name', 'username'] },
        { association: 'fund', attributes: ['id', 'name', 'logo_url', 'website'] },
      ],
    })

    if (!campaign) {
      throw new AppError('Campaign not found', 404)
    }

    // Получаем все пожертвования
    const donations = await Donation.findAll({
      where: {
        campaign_id: campaignId,
        status: 'paid',
      },
      include: [
        {
          association: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['paid_at', 'DESC']],
    })

    const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount_value), 0)
    const participantCount = new Set(donations.map((d) => d.user_id)).size

    return {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        goal_amount: Number(campaign.goal_amount),
        collected_amount: Number(campaign.collected_amount),
        status: campaign.status,
        category: campaign.category,
        country_code: campaign.country_code,
        owner: campaign.owner,
        fund: campaign.fund,
        created_at: campaign.created_at,
        end_date: campaign.end_date,
      },
      statistics: {
        total_donations: totalDonations,
        participant_count: participantCount,
        donation_count: donations.length,
        progress_percent: (Number(campaign.collected_amount) / Number(campaign.goal_amount)) * 100,
      },
      donations: donations.map((d) => ({
        id: d.id,
        amount: Number(d.amount_value),
        currency: d.currency,
        user: d.user,
        paid_at: d.paid_at,
      })),
      completed: campaign.status === 'completed',
    }
  }

  /**
   * Автоматическая проверка и завершение кампаний
   */
  async checkAndCompleteCampaigns() {
    const now = new Date()

    // Кампании, которые достигли цели
    const campaignsToComplete = await Campaign.findAll({
      where: {
        status: 'active',
      },
    })

    let completedByGoal = 0
    for (const campaign of campaignsToComplete) {
      if (Number(campaign.collected_amount) >= Number(campaign.goal_amount)) {
        campaign.status = 'completed'
        await campaign.save()
        completedByGoal++
      }
    }

    // Кампании, у которых истек срок
    const completedByDate = await Campaign.update(
      { status: 'completed' },
      {
        where: {
          status: 'active',
          end_date: {
            [Op.lt]: now,
          },
        },
      }
    )

    logger.info(`Completed campaigns: ${completedByGoal} by goal, ${completedByDate[0]} by date`)

    return {
      completed_by_goal: completedByGoal,
      completed_by_date: completedByDate[0],
    }
  }
}

export const campaignsService = new CampaignsService()
