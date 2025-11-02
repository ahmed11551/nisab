import axios, { AxiosInstance } from 'axios'
import { config } from '../../config'
import { logger } from '../../utils/logger'
import { Fund } from '../../database/models/Fund'

const INDEX_NAME = 'funds'

export class ElasticsearchService {
  private client: AxiosInstance
  private baseUrl: string

  constructor() {
    this.baseUrl = config.external.elasticsearchUrl
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  /**
   * Создает индекс для фондов
   */
  async createIndex() {
    try {
      const mapping = {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              fields: {
                kw: { type: 'keyword' },
              },
            },
            country_code: { type: 'keyword' },
            purposes: { type: 'keyword' },
            categories: { type: 'keyword' },
            verified: { type: 'boolean' },
            partner_enabled: { type: 'boolean' },
            logo_url: { type: 'keyword' },
            short_desc: { type: 'text' },
            website: { type: 'keyword' },
            social_links: { type: 'keyword' },
            active: { type: 'boolean' },
            created_at: { type: 'date' },
          },
        },
      }

      const response = await this.client.put(`/${INDEX_NAME}`, mapping)
      logger.info(`Elasticsearch index ${INDEX_NAME} created`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data.error.type === 'resource_already_exists_exception') {
        logger.info(`Elasticsearch index ${INDEX_NAME} already exists`)
        return null
      }
      logger.error('Failed to create Elasticsearch index:', error)
      throw error
    }
  }

  /**
   * Индексирует фонд
   */
  async indexFund(fund: Fund) {
    try {
      const doc = {
        id: fund.id,
        name: fund.name,
        country_code: fund.country_code,
        purposes: fund.purposes,
        categories: fund.categories,
        verified: fund.verified,
        partner_enabled: fund.partner_enabled,
        logo_url: fund.logo_url,
        short_desc: fund.short_desc,
        website: fund.website,
        social_links: fund.social_links,
        active: fund.active,
        created_at: fund.created_at,
      }

      await this.client.put(`/${INDEX_NAME}/_doc/${fund.id}`, doc)
      logger.debug(`Fund ${fund.id} indexed in Elasticsearch`)
    } catch (error: any) {
      logger.error(`Failed to index fund ${fund.id}:`, error)
      throw error
    }
  }

  /**
   * Удаляет фонд из индекса
   */
  async deleteFund(fundId: string) {
    try {
      await this.client.delete(`/${INDEX_NAME}/_doc/${fundId}`)
      logger.debug(`Fund ${fundId} deleted from Elasticsearch`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.debug(`Fund ${fundId} not found in Elasticsearch`)
        return
      }
      logger.error(`Failed to delete fund ${fundId}:`, error)
      throw error
    }
  }

  /**
   * Поиск фондов
   */
  async searchFunds(params: {
    country?: string
    purpose?: string
    categories?: string[]
    query?: string
    from?: number
    size?: number
  }) {
    try {
      const must: any[] = [{ term: { active: true } }]
      const filter: any[] = []

      if (params.country) {
        filter.push({ term: { country_code: params.country } })
      }

      if (params.purpose) {
        filter.push({ term: { purposes: params.purpose } })
      }

      if (params.categories && params.categories.length > 0) {
        filter.push({ terms: { categories: params.categories } })
      }

      if (params.query) {
        must.push({
          multi_match: {
            query: params.query,
            fields: ['name', 'short_desc'],
            fuzziness: 'AUTO',
          },
        })
      }

      const searchQuery = {
        query: {
          bool: {
            must,
            filter,
          },
        },
        sort: [
          { verified: { order: 'desc' } },
          { _score: { order: 'desc' } },
        ],
        from: params.from || 0,
        size: params.size || 20,
      }

      const response = await this.client.post(`/${INDEX_NAME}/_search`, searchQuery)
      const hits = response.data.hits

      return {
        items: hits.hits.map((hit: any) => hit._source),
        total: hits.total.value,
      }
    } catch (error: any) {
      logger.error('Elasticsearch search failed:', error)
      throw error
    }
  }

  /**
   * Синхронизирует все фонды из базы данных в Elasticsearch
   */
  async syncAllFunds() {
    try {
      const funds = await Fund.findAll({ where: { active: true } })
      logger.info(`Syncing ${funds.length} funds to Elasticsearch`)

      for (const fund of funds) {
        await this.indexFund(fund)
      }

      logger.info(`Successfully synced ${funds.length} funds to Elasticsearch`)
    } catch (error: any) {
      logger.error('Failed to sync funds to Elasticsearch:', error)
      throw error
    }
  }

  /**
   * Проверяет подключение к Elasticsearch
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/_cluster/health')
      return true
    } catch (error) {
      logger.warn('Elasticsearch health check failed:', error)
      return false
    }
  }
}

export const elasticsearchService = new ElasticsearchService()

