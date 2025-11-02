import { Sequelize } from 'sequelize'
import { config } from '../config'
import { logger } from '../utils/logger'

export const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate()
    logger.info('Database connection established')

    // Import models
    await import('./models')
    
    // Sync database (in production, use migrations instead)
    if (config.env === 'development') {
      await sequelize.sync({ alter: true })
      logger.info('Database synced')
    }
  } catch (error) {
    logger.error('Unable to connect to database:', error)
    throw error
  }
}

