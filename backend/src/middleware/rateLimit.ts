import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler'
import { logger } from '../utils/logger'

/**
 * Rate Limiter Store - in-memory хранилище для rate limiting
 * Можно заменить на Redis для production с несколькими инстансами сервера
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Очистка истёкших записей каждую минуту
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key)
        }
      }
    }, 60000) // Каждую минуту
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetTime < now) {
      // Новая запись или окно истекло
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      }
      this.store.set(key, newEntry)
      return { count: 1, resetTime: newEntry.resetTime }
    }

    // Увеличиваем счётчик
    entry.count++
    this.store.set(key, entry)
    return { count: entry.count, resetTime: entry.resetTime }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key)
    if (entry && entry.resetTime >= Date.now()) {
      return entry
    }
    return undefined
  }

  clear() {
    this.store.clear()
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

const rateLimitStore = new RateLimitStore()

/**
 * Получает уникальный ключ для rate limiting на основе пользователя или IP
 */
function getRateLimitKey(req: Request): string {
  // Приоритет: user ID > IP адрес
  const user = (req as any).user
  if (user && user.id) {
    return `user:${user.id}`
  }

  // Используем IP адрес как fallback
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return `ip:${ip}`
}

/**
 * Rate Limiting Middleware
 * 
 * Ограничивает количество запросов на пользователя/IP
 * Согласно ТЗ: 50 запросов в минуту на пользователя
 * 
 * @param options - Опции для rate limiting
 * @param options.max - Максимальное количество запросов (по умолчанию 50)
 * @param options.windowMs - Окно времени в миллисекундах (по умолчанию 60000 = 1 минута)
 * @param options.skipSuccessfulRequests - Пропускать успешные запросы (по умолчанию false)
 * @param options.skipFailedRequests - Пропускать неудачные запросы (по умолчанию false)
 */
export function rateLimit(options: {
  max?: number
  windowMs?: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
} = {}) {
  const {
    max = 50, // 50 запросов в минуту по ТЗ
    windowMs = 60000, // 1 минута
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Слишком много запросов. Пожалуйста, попробуйте позже.',
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getRateLimitKey(req)
      const { count, resetTime } = rateLimitStore.increment(key, windowMs)

      // Добавляем заголовки с информацией о лимитах
      const remaining = Math.max(0, max - count)
      const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000)

      res.setHeader('X-RateLimit-Limit', max.toString())
      res.setHeader('X-RateLimit-Remaining', remaining.toString())
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString())
      res.setHeader('Retry-After', resetSeconds.toString())

      // Проверяем превышение лимита
      if (count > max) {
        logger.warn(`Rate limit exceeded for ${key}: ${count} requests (limit: ${max})`)
        
        return res.status(429).json({
          success: false,
          error: {
            message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: resetSeconds,
          },
        })
      }

      // Логируем при приближении к лимиту (80% использования)
      if (count >= max * 0.8 && count < max) {
        logger.debug(`Rate limit warning for ${key}: ${count}/${max} requests`)
      }

      // Сохраняем информацию о rate limit в запросе для возможной проверки в контроллерах
      ;(req as any).rateLimit = {
        limit: max,
        remaining,
        reset: resetTime,
        count,
      }

      next()
    } catch (error: any) {
      logger.error('Rate limit middleware error:', error)
      // В случае ошибки пропускаем запрос (fail-open для безопасности)
      next()
    }
  }
}

/**
 * Rate Limiter для конкретных маршрутов с разными лимитами
 */
export const rateLimiters = {
  // Общий лимит для API (50 req/min по ТЗ)
  api: rateLimit({
    max: 50,
    windowMs: 60000,
    message: 'Слишком много запросов к API. Пожалуйста, попробуйте через минуту.',
  }),

  // Строгий лимит для аутентификации (5 req/min)
  auth: rateLimit({
    max: 5,
    windowMs: 60000,
    message: 'Слишком много попыток входа. Пожалуйста, попробуйте через минуту.',
  }),

  // Лимит для создания кампаний (10 req/hour)
  campaignCreate: rateLimit({
    max: 10,
    windowMs: 3600000, // 1 час
    message: 'Вы можете создать максимум 10 кампаний в час. Пожалуйста, попробуйте позже.',
  }),

  // Лимит для пожертвований (20 req/min)
  donation: rateLimit({
    max: 20,
    windowMs: 60000,
    message: 'Слишком много попыток пожертвования. Пожалуйста, попробуйте через минуту.',
  }),

  // Лимит для подписок (5 req/min)
  subscription: rateLimit({
    max: 5,
    windowMs: 60000,
    message: 'Слишком много попыток оформления подписки. Пожалуйста, попробуйте через минуту.',
  }),
}

// Экспортируем store для возможного использования в тестах или админ-панели
export { rateLimitStore }

