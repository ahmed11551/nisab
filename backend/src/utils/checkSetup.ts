import { config } from '../config'
import { sequelize } from '../database'
import { elasticsearchService } from '../integrations/elasticsearch'
import { logger } from './logger'

/**
 * Проверяет готовность проекта к запуску
 */
export async function checkSetup() {
  const checks = {
    database: false,
    elasticsearch: false,
    telegram: false,
    payments: false,
  }

  const errors: string[] = []
  const warnings: string[] = []

  // Проверка базы данных
  try {
    await sequelize.authenticate()
    checks.database = true
    logger.info('✓ Database connection: OK')
  } catch (error: any) {
    errors.push(`Database connection failed: ${error.message}`)
    logger.error('✗ Database connection: FAILED')
  }

  // Проверка Elasticsearch
  try {
    const isHealthy = await elasticsearchService.healthCheck()
    if (isHealthy) {
      checks.elasticsearch = true
      logger.info('✓ Elasticsearch connection: OK')
    } else {
      warnings.push('Elasticsearch is not available, using database fallback')
      logger.warn('⚠ Elasticsearch connection: NOT AVAILABLE (will use DB fallback)')
    }
  } catch (error: any) {
    warnings.push(`Elasticsearch not available: ${error.message}`)
    logger.warn('⚠ Elasticsearch connection: NOT AVAILABLE (will use DB fallback)')
  }

  // Проверка Telegram Bot
  if (!config.telegram.botToken || config.telegram.botToken === 'your_bot_token_here') {
    warnings.push('Telegram Bot Token not configured')
    logger.warn('⚠ Telegram Bot Token: NOT CONFIGURED')
  } else {
    checks.telegram = true
    logger.info('✓ Telegram Bot Token: OK')
  }

  if (!config.telegram.webappSecret || config.telegram.webappSecret === 'your_webapp_secret_here') {
    warnings.push('Telegram WebApp Secret not configured')
    logger.warn('⚠ Telegram WebApp Secret: NOT CONFIGURED')
  } else {
    logger.info('✓ Telegram WebApp Secret: OK')
  }

  // Проверка платежных систем
  if (!config.payments.yookassa.shopId || config.payments.yookassa.shopId === 'your_shop_id') {
    warnings.push('YooKassa credentials not configured')
    logger.warn('⚠ YooKassa: NOT CONFIGURED')
  } else {
    checks.payments = true
    logger.info('✓ YooKassa: OK')
  }

  if (!config.payments.cloudpayments.publicId || config.payments.cloudpayments.publicId === 'your_public_id') {
    warnings.push('CloudPayments credentials not configured')
    logger.warn('⚠ CloudPayments: NOT CONFIGURED')
  } else {
    logger.info('✓ CloudPayments: OK')
  }

  // Итоговый отчет
  logger.info('\n=== Setup Check Summary ===')
  logger.info(`Database: ${checks.database ? '✓' : '✗'}`)
  logger.info(`Elasticsearch: ${checks.elasticsearch ? '✓' : '⚠ (optional)'}`)
  logger.info(`Telegram: ${checks.telegram ? '✓' : '⚠'}`)
  logger.info(`Payments: ${checks.payments ? '✓' : '⚠'}`)

  if (errors.length > 0) {
    logger.error('\n❌ Critical errors found:')
    errors.forEach((error) => logger.error(`  - ${error}`))
  }

  if (warnings.length > 0) {
    logger.warn('\n⚠️  Warnings:')
    warnings.forEach((warning) => logger.warn(`  - ${warning}`))
  }

  if (errors.length === 0) {
    logger.info('\n✅ Project is ready to run!')
    if (warnings.length > 0) {
      logger.warn('⚠️  Some features may not work until warnings are resolved')
    }
  } else {
    logger.error('\n❌ Please fix critical errors before starting the server')
  }

  return {
    checks,
    errors,
    warnings,
    ready: errors.length === 0,
  }
}
