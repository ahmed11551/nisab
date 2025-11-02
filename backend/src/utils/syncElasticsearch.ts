import { elasticsearchService } from '../integrations/elasticsearch'
import { logger } from './logger'

/**
 * Синхронизирует данные с Elasticsearch
 * Запускается при старте приложения (опционально)
 */
export async function syncElasticsearchOnStart() {
  try {
    const isHealthy = await elasticsearchService.healthCheck()
    
    if (!isHealthy) {
      logger.warn('Elasticsearch is not available, skipping sync')
      return
    }

    // Создаем индекс если не существует
    await elasticsearchService.createIndex()

    // Синхронизируем фонды
    await elasticsearchService.syncAllFunds()

    logger.info('Elasticsearch sync completed')
  } catch (error) {
    logger.error('Elasticsearch sync failed:', error)
    // Не прерываем запуск приложения, если Elasticsearch недоступен
  }
}

