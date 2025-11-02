import { Fund } from '../database/models/Fund'
import { elasticsearchService } from '../integrations/elasticsearch'
import { eReplikaApi } from '../integrations/ereplika/api'
import { logger } from '../utils/logger'
import { Op } from 'sequelize'

class FundsService {
  /**
   * Получить список фондов
   * Сначала пытается получить из EReplika API, затем из локальной БД
   */
  async listFunds(params: {
    country?: string
    purpose?: string
    query?: string
    from?: number
    size?: number
  }) {
    // Сначала пытаемся получить из EReplika API
    try {
      const isHealthy = await eReplikaApi.healthCheck()
      
      if (isHealthy) {
        logger.debug('Fetching funds from EReplika API')
        const funds = await eReplikaApi.getFunds({
          country: params.country,
          purpose: params.purpose,
          search: params.query,
          from: params.from,
          size: params.size,
        })

        if (funds && funds.items && funds.items.length > 0) {
          return funds
        }
      }
    } catch (error) {
      logger.warn('EReplika API unavailable, falling back to database:', error)
    }

    // Fallback: Try Elasticsearch
    try {
      const isHealthy = await elasticsearchService.healthCheck()
      
      if (isHealthy) {
        const result = await elasticsearchService.searchFunds({
          country: params.country,
          purpose: params.purpose,
          query: params.query,
          from: params.from,
          size: params.size,
        })

        if (result.items.length > 0) {
          return result
        }
      }
    } catch (error) {
      logger.warn('Elasticsearch unavailable, falling back to database:', error)
    }

    // Fallback: Database
    const where: any = { active: true }
    if (params.country) {
      where.country_code = params.country
    }
    if (params.purpose) {
      where.purposes = { [Op.contains]: [params.purpose] }
    }

    const funds = await Fund.findAll({
      where,
      limit: params.size || 20,
      offset: params.from || 0,
      order: [['verified', 'DESC'], ['created_at', 'DESC']],
    })

    return {
      items: funds,
      total: await Fund.count({ where }),
    }
  }

  /**
   * Получить фонд по ID
   * Сначала из EReplika API, затем из локальной БД
   */
  async getFund(id: string) {
    // Сначала пытаемся получить из EReplika API
    try {
      const isHealthy = await eReplikaApi.healthCheck()
      
      if (isHealthy) {
        const fund = await eReplikaApi.getFund(id)
        if (fund) {
          return fund
        }
      }
    } catch (error) {
      logger.debug(`Fund ${id} not found in EReplika API, checking local database`)
    }

    // Fallback: Database
    const fund = await Fund.findByPk(id)
    return fund
  }

  /**
   * Синхронизировать фонды из EReplika API
   */
  async syncFromEReplika() {
    try {
      const result = await eReplikaApi.syncFunds()
      
      // После синхронизации, обновляем Elasticsearch
      try {
        await elasticsearchService.syncAllFunds()
      } catch (error) {
        logger.warn('Failed to sync Elasticsearch after EReplika sync:', error)
      }

      return result
    } catch (error) {
      logger.error('Failed to sync funds from EReplika:', error)
      throw error
    }
  }
}

export const fundsService = new FundsService()
