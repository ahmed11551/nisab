import axios, { AxiosInstance } from 'axios'
import { config } from '../../config'
import { logger } from '../../utils/logger'

/**
 * Интеграция с API bot.e-replika.ru
 * Документация: https://bot.e-replika.ru/docs
 */
export class EReplikaApi {
  private client: AxiosInstance
  private baseUrl: string
  private apiToken: string

  constructor() {
    this.baseUrl = config.external.botEReplikaUrl
    this.apiToken = config.external.apiToken

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      },
    })

    // Request interceptor для логирования
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`EReplika API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        logger.error('EReplika API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: any) => {
        logger.error('EReplika API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Получить список фондов
   */
  async getFunds(params?: {
    country?: string
    purpose?: string
    category?: string
    search?: string
    from?: number
    size?: number
  }) {
    try {
      const response = await this.client.get('/api/funds', { params })
      return response.data
    } catch (error: any) {
      logger.error('Failed to get funds from EReplika:', error)
      throw error
    }
  }

  /**
   * Получить информацию о фонде
   */
  async getFund(fundId: string) {
    try {
      const response = await this.client.get(`/api/funds/${fundId}`)
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get fund ${fundId} from EReplika:`, error)
      throw error
    }
  }

  /**
   * Синхронизировать фонды с локальной базой данных
   */
  async syncFunds() {
    try {
      const funds = await this.getFunds({ size: 1000 })
      
      const { Fund } = await import('../../database/models/Fund')
      const { sequelize } = await import('../../database')

      let synced = 0
      let created = 0
      let updated = 0

      if (funds.items && Array.isArray(funds.items)) {
        for (const fundData of funds.items) {
          try {
            // Преобразуем social_links из объекта в массив строк
            let socialLinks: string[] = []
            if (fundData.social_links) {
              if (Array.isArray(fundData.social_links)) {
                socialLinks = fundData.social_links
              } else if (typeof fundData.social_links === 'object') {
                socialLinks = Object.entries(fundData.social_links).map(([key, value]) => `${key}:${value}`)
              }
            }

            const [fund, wasCreated] = await Fund.findOrCreate({
              where: { id: fundData.id },
              defaults: {
                id: fundData.id,
                name: fundData.name,
                short_desc: fundData.short_desc || fundData.description || '',
                country_code: fundData.country_code || fundData.country || 'RU',
                purposes: fundData.purposes || (fundData.purpose ? [fundData.purpose] : []),
                categories: fundData.categories || [],
                verified: fundData.verified || false,
                partner_enabled: fundData.partner_enabled || false,
                logo_url: fundData.logo_url || fundData.logo,
                website: fundData.website,
                social_links: socialLinks,
                active: fundData.active !== false,
              },
            })

            if (wasCreated) {
              created++
            } else {
              // Обновляем существующий фонд
              // Преобразуем social_links если нужно обновить
              let updatedSocialLinks: string[] = fund.social_links || []
              if (fundData.social_links) {
                if (Array.isArray(fundData.social_links)) {
                  updatedSocialLinks = fundData.social_links
                } else if (typeof fundData.social_links === 'object') {
                  updatedSocialLinks = Object.entries(fundData.social_links).map(([key, value]) => `${key}:${value}`)
                }
              }

              await fund.update({
                name: fundData.name || fund.name,
                short_desc: fundData.short_desc || fundData.description || fund.short_desc,
                country_code: fundData.country_code || fundData.country || fund.country_code,
                purposes: fundData.purposes || (fundData.purpose ? [fundData.purpose] : fund.purposes),
                categories: fundData.categories || fund.categories,
                verified: fundData.verified !== undefined ? fundData.verified : fund.verified,
                partner_enabled: fundData.partner_enabled !== undefined ? fundData.partner_enabled : fund.partner_enabled,
                logo_url: fundData.logo_url || fundData.logo || fund.logo_url,
                website: fundData.website || fund.website,
                social_links: updatedSocialLinks,
                active: fundData.active !== undefined ? fundData.active : fund.active,
              })
              updated++
            }
            synced++
          } catch (error: any) {
            logger.warn(`Failed to sync fund ${fundData.id}:`, error.message)
          }
        }
      }

      logger.info(`EReplika sync completed: ${synced} total, ${created} created, ${updated} updated`)
      
      return {
        synced,
        created,
        updated,
      }
    } catch (error: any) {
      logger.error('Failed to sync funds from EReplika:', error)
      throw error
    }
  }

  /**
   * Получить информацию о пользователе
   */
  async getUser(userId: number) {
    try {
      const response = await this.client.get(`/api/users/${userId}`)
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get user ${userId} from EReplika:`, error)
      throw error
    }
  }

  /**
   * Проверить подключение к API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      logger.warn('EReplika API health check failed:', error)
      return false
    }
  }
}

export const eReplikaApi = new EReplikaApi()

