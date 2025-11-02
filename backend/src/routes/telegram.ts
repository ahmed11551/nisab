import { Router, Request, Response } from 'express'
import { telegramBot } from '../integrations/telegram/bot'
import { logger } from '../utils/logger'
import { User } from '../database/models/User'

export const telegramRoutes = Router()

/**
 * Сохраняет или обновляет пользователя в БД
 */
async function saveOrUpdateUser(userData: {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}) {
  try {
    const [user] = await User.findOrCreate({
      where: { tg_id: userData.id },
      defaults: {
        tg_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        language_code: userData.language_code,
        locale: userData.language_code?.split('-')[0] || 'ru',
      },
    })

    // Обновляем данные, если они изменились
    if (user.first_name !== userData.first_name || 
        user.last_name !== userData.last_name ||
        user.username !== userData.username) {
      await user.update({
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        language_code: userData.language_code,
      })
    }

    return user
  } catch (error) {
    logger.error('Failed to save/update user:', error)
    throw error
  }
}

/**
 * Webhook для получения обновлений от Telegram
 * POST /api/v1/telegram/webhook
 */
telegramRoutes.post('/webhook', async (req: Request, res: Response) => {
  try {
    const update = req.body as any

    // Обрабатываем сообщения
    if (update.message) {
      const { message } = update
      const text = message.text || ''
      const chatId = message.chat.id

      // Сохраняем пользователя в БД
      if (message.from) {
        try {
          await saveOrUpdateUser({
            id: message.from.id,
            first_name: message.from.first_name,
            last_name: message.from.last_name,
            username: message.from.username,
            language_code: message.from.language_code,
          })
        } catch (error) {
          logger.error('Failed to save user in webhook:', error)
          // Продолжаем обработку даже если не удалось сохранить пользователя
        }
      }

      // Команды начинаются с /
      if (text.startsWith('/')) {
        const [command, ...params] = text.split(' ')
        await telegramBot.handleCommand(chatId, command, params)
      } else {
        // Обычное сообщение
        await telegramBot.sendMessage(chatId, 'Используйте /start для начала')
      }
    }

    // Обрабатываем callback_query (нажатия на кнопки)
    if (update.callback_query) {
      const { callback_query } = update
      
      // Сохраняем пользователя в БД
      if (callback_query.from) {
        try {
          await saveOrUpdateUser({
            id: callback_query.from.id,
            first_name: callback_query.from.first_name,
            last_name: callback_query.from.last_name,
            username: callback_query.from.username,
            language_code: callback_query.from.language_code,
          })
        } catch (error) {
          logger.error('Failed to save user in callback:', error)
          // Продолжаем обработку даже если не удалось сохранить пользователя
        }
      }

      await telegramBot.handleCallbackQuery(callback_query)
    }

    // Всегда отвечаем 200 OK
    res.status(200).json({ ok: true })
  } catch (error) {
    logger.error('Telegram webhook error:', error)
    res.status(200).json({ ok: true }) // Telegram требует 200 OK даже при ошибке
  }
})

/**
 * Установка webhook
 * POST /api/v1/telegram/set-webhook
 * Body: { url: string }
 */
telegramRoutes.post('/set-webhook', async (req: Request, res: Response) => {
  try {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required in body' })
    }

    const result = await telegramBot.setWebhook(url)
    logger.info('Webhook set successfully:', result)
    
    res.json({
      success: true,
      result,
      message: 'Webhook установлен успешно',
    })
  } catch (error: any) {
    logger.error('Set webhook error:', error)
    res.status(500).json({ 
      error: 'Failed to set webhook',
      details: error.response?.data || error.message,
    })
  }
})

/**
 * Получение информации о webhook
 * GET /api/v1/telegram/webhook-info
 */
telegramRoutes.get('/webhook-info', async (req: Request, res: Response) => {
  try {
    const info = await telegramBot.getWebhookInfo()
    res.json({
      success: true,
      info,
    })
  } catch (error: any) {
    logger.error('Get webhook info error:', error)
    res.status(500).json({ 
      error: 'Failed to get webhook info',
      details: error.response?.data || error.message,
    })
  }
})

/**
 * Удаление webhook
 * DELETE /api/v1/telegram/webhook
 */
telegramRoutes.delete('/webhook', async (req: Request, res: Response) => {
  try {
    const result = await telegramBot.deleteWebhook()
    logger.info('Webhook deleted successfully:', result)
    
    res.json({
      success: true,
      result,
      message: 'Webhook удален успешно',
    })
  } catch (error: any) {
    logger.error('Delete webhook error:', error)
    res.status(500).json({ 
      error: 'Failed to delete webhook',
      details: error.response?.data || error.message,
    })
  }
})

/**
 * Установка webhook (GET для совместимости)
 * GET /api/v1/telegram/set-webhook?url=https://your-domain.com/api/v1/telegram/webhook
 */
telegramRoutes.get('/set-webhook', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string
    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter required',
        usage: 'GET /api/v1/telegram/set-webhook?url=https://your-domain.com/api/v1/telegram/webhook',
        alternative: 'POST /api/v1/telegram/set-webhook with body: { "url": "..." }',
      })
    }

    const result = await telegramBot.setWebhook(url)
    logger.info('Webhook set successfully:', result)
    
    res.json({
      success: true,
      result,
      message: 'Webhook установлен успешно',
    })
  } catch (error: any) {
    logger.error('Set webhook error:', error)
    res.status(500).json({ 
      error: 'Failed to set webhook',
      details: error.response?.data || error.message,
    })
  }
})

