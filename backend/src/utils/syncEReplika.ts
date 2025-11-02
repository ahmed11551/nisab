import { eReplikaApi } from '../integrations/ereplika/api'
import { fundsService } from '../services/funds'
import { logger } from './logger'

/**
 * Синхронизирует данные с EReplika API
 * Запускается при старте приложения (опционально)
 */
export async function syncEReplikaOnStart() {
  try {
    const isHealthy = await eReplikaApi.healthCheck()
    
    if (!isHealthy) {
      logger.warn('EReplika API is not available, skipping sync')
      return
    }

    // Синхронизируем фонды
    await fundsService.syncFromEReplika()

    logger.info('EReplika sync completed')
  } catch (error) {
    logger.error('EReplika sync failed:', error)
    // Не прерываем запуск приложения, если EReplika недоступен
  }
}
