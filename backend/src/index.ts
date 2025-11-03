import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { initializeDatabase } from './database'
import { routes } from './routes'
import { syncElasticsearchOnStart } from './utils/syncElasticsearch'
import { syncEReplikaOnStart } from './utils/syncEReplika'
import { rateLimiters } from './middleware/rateLimit'

dotenv.config()

const app = express()
const PORT = config.port

// Middleware
app.use(helmet())
// Support comma-separated CORS origins from env (e.g. "https://t.me,https://web.telegram.org,http://localhost:5173,https://xavi-overoptimistic-ciera.ngrok-free.dev")
const allowedOrigins = (config.corsOrigin || '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

app.use(cors({
  origin: allowedOrigins.length > 1 ? allowedOrigins : config.corsOrigin,
  credentials: true,
}))

// Trust proxy для правильного определения IP адреса (если используется за прокси)
app.set('trust proxy', 1)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check (без rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes с rate limiting (50 req/min по ТЗ)
app.use('/api/v1', rateLimiters.api, routes)

// Error handling
app.use(errorHandler)

// Start server
async function start() {
  try {
    // Проверка готовности проекта (опционально)
    if (config.env === 'development') {
      const { checkSetup } = await import('./utils/checkSetup')
      await checkSetup()
    }

    await initializeDatabase()
    logger.info('Database initialized')

    // Синхронизация с Elasticsearch (опционально, не блокирует запуск)
    if (config.env !== 'test') {
      syncElasticsearchOnStart().catch((err) => {
        logger.warn('Elasticsearch sync failed, continuing without it:', err)
      })

      // Синхронизация с EReplika API (опционально, не блокирует запуск)
      syncEReplikaOnStart().catch((err) => {
        logger.warn('EReplika sync failed, continuing without it:', err)
      })
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${config.env}`)
      logger.info(`Health check: http://localhost:${PORT}/health`)
      logger.info(`API docs: http://localhost:${PORT}/api/v1`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

