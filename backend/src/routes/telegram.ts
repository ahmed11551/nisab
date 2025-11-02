import { Router, Request, Response } from 'express'
import { telegramBot } from '../integrations/telegram/bot'
import { logger } from '../utils/logger'

export const telegramRoutes = Router()

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
      await telegramBot.handleCallbackQuery(update.callback_query)
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
 * GET /api/v1/telegram/set-webhook?url=https://your-domain.com/api/v1/telegram/webhook
 */
telegramRoutes.get('/set-webhook', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' })
    }

    // Здесь нужно сделать запрос к Telegram API для установки webhook
    // Это делается отдельно через curl или другой инструмент
    res.json({
      message: 'Use this curl command to set webhook:',
      command: `curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" -d "url=${url}"`,
    })
  } catch (error) {
    logger.error('Set webhook error:', error)
    res.status(500).json({ error: 'Failed to set webhook' })
  }
})

