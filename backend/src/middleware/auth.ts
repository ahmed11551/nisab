import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { config } from '../config'
import { AppError } from './errorHandler'

interface TelegramInitData {
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
  }
  query_id?: string
  auth_date: number
  hash: string
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    languageCode?: string
  }
}

const validateTelegramInitData = (initData: string): TelegramInitData => {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    if (!hash) throw new Error('Hash not found')

    urlParams.delete('hash')

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegram.webappSecret)
      .digest()

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      throw new Error('Invalid hash')
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10)
    const currentTime = Math.floor(Date.now() / 1000)
    if (currentTime - authDate > 86400) {
      throw new Error('Init data expired')
    }

    const userStr = urlParams.get('user')
    const user = userStr ? JSON.parse(userStr) : undefined

    return {
      user,
      query_id: urlParams.get('query_id') || undefined,
      auth_date: authDate,
      hash,
    }
  } catch (error) {
    throw new Error(`Invalid init data: ${error}`)
  }
}

export const authenticateTelegram = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string
    if (!initData) {
      throw new AppError('Telegram init data required', 401)
    }

    const validated = validateTelegramInitData(initData)
    if (validated.user) {
      req.user = {
        id: validated.user.id,
        firstName: validated.user.first_name,
        lastName: validated.user.last_name,
        username: validated.user.username,
        languageCode: validated.user.language_code,
      }
    }

    next()
  } catch (error) {
    next(new AppError('Authentication failed', 401))
  }
}

