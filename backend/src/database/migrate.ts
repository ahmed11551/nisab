import { sequelize } from './index'
import { config } from '../config'
import { logger } from '../utils/logger'

/**
 * Запускает миграции базы данных
 * В production используйте Sequelize CLI или отдельные SQL-скрипты
 */
async function migrate() {
  try {
    await sequelize.authenticate()
    logger.info('Database connection established')

    // Импортируем модели для регистрации
    await import('./models')

    const direction = process.argv[2] === 'down' ? 'down' : 'up'

    if (direction === 'down') {
      // В production используйте миграции Sequelize CLI
      logger.warn('Sync down not implemented. Use Sequelize CLI migrations in production.')
      await sequelize.drop()
      logger.info('Database dropped')
    } else {
      // Синхронизация схемы (alter: true только для dev)
      if (config.env === 'development') {
        await sequelize.sync({ alter: true })
        logger.info('Database synced with alter')
      } else {
        // В production используйте миграции
        logger.warn('In production, use Sequelize CLI migrations instead of sync')
        await sequelize.sync()
        logger.info('Database synced')
      }
    }

    await sequelize.close()
    logger.info('Migration completed')
  } catch (error) {
    logger.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()

