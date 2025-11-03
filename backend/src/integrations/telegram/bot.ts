import axios, { AxiosInstance } from 'axios'
import { config } from '../../config'
import { logger } from '../../utils/logger'

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  text?: string
  data?: string // для callback_query
}

interface TelegramCallbackQuery {
  id: string
  from: {
    id: number
    first_name: string
    username?: string
  }
  message?: TelegramMessage
  data: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export class TelegramBot {
  private client: AxiosInstance
  private botToken: string
  private baseUrl: string

  constructor() {
    this.botToken = config.telegram.botToken
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    })
  }

  /**
   * Отправляет сообщение пользователю
   */
  async sendMessage(chatId: number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    reply_markup?: {
      inline_keyboard?: Array<Array<{
        text: string
        url?: string
        callback_data?: string
        web_app?: { url: string }
      }>>
    }
  }) {
    try {
      const response = await this.client.post('/sendMessage', {
        chat_id: chatId,
        text,
        ...options,
      })
      return response.data
    } catch (error: any) {
      logger.error('Failed to send Telegram message:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Отправляет уведомление об успешном пожертвовании
   */
  async notifyDonationSuccess(chatId: number, donation: {
    id: string
    amount: number
    currency: string
    fund_name?: string
  }) {
    const text = `
✅ Пожертвование успешно!

Сумма: ${donation.amount} ${donation.currency}
${donation.fund_name ? `Фонд: ${donation.fund_name}` : ''}
ID: ${donation.id}

Благодарим за вашу помощь! 🕌
    `.trim()

    return this.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 История', callback_data: 'history' },
            { text: '💰 Пожертвовать еще', callback_data: 'donate' },
          ],
          [
            {
              text: '🌐 Открыть Mini App',
              web_app: { url: `${config.frontendUrl}/donate` },
            },
          ],
        ],
      },
    })
  }

  /**
   * Отправляет уведомление об успешной подписке
   */
  async notifySubscriptionSuccess(chatId: number, subscription: {
    id: string
    plan: string
    period: string
    next_charge_at: Date
  }) {
    const text = `
✅ Подписка активирована!

План: ${subscription.plan}
Период: ${subscription.period}
Следующее списание: ${new Date(subscription.next_charge_at).toLocaleDateString('ru-RU')}

Спасибо за поддержку! 🙏
    `.trim()

    return this.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📅 Управление подпиской', callback_data: `subscription:${subscription.id}` },
            { text: '🌐 Открыть Mini App', web_app: { url: `${config.frontendUrl}/subscription` } },
          ],
        ],
      },
    })
  }

  /**
   * Обрабатывает команды бота
   */
  async handleCommand(chatId: number, command: string, params?: string[]) {
    switch (command) {
      case '/start':
        return this.sendMessage(chatId, `Добро пожаловать в Nisab! 🕌

Платформа для садака и закята. Выберите действие:`, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Пожертвовать', callback_data: 'donate' },
                { text: '📅 Подписка', callback_data: 'subscription' },
              ],
              [
                { text: '📊 Калькулятор закята', callback_data: 'zakat' },
                { text: '🎯 Кампании', callback_data: 'campaigns' },
              ],
              [
                { text: '📖 История', callback_data: 'history' },
                { text: 'ℹ️ Помощь', callback_data: 'help' },
              ],
              [
                {
                  text: '🌐 Открыть Mini App',
                  web_app: { url: `${config.frontendUrl}` },
                },
              ],
            ],
          },
        })

      case '/sadaqa':
      case '/donate':
        return this.sendMessage(chatId, 'Выберите действие:', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Пожертвовать', callback_data: 'donate' },
                { text: '❤️ Поддержать проект', callback_data: 'support' },
              ],
              [
                {
                  text: '🌐 Открыть Mini App',
                  web_app: { url: `${config.frontendUrl}/donate` },
                },
              ],
            ],
          },
        })

      case '/support':
        return this.sendMessage(chatId, 'Поддержка проекта:', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '500 ₽', callback_data: 'support:500' },
                { text: '1000 ₽', callback_data: 'support:1000' },
                { text: '2500 ₽', callback_data: 'support:2500' },
              ],
              [
                {
                  text: '🌐 Открыть Mini App',
                  web_app: { url: `${config.frontendUrl}/support` },
                },
              ],
            ],
          },
        })

      case '/zakat':
        return this.sendMessage(chatId, 'Калькулятор закята:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть калькулятор',
                  web_app: { url: `${config.frontendUrl}/zakat` },
                },
              ],
            ],
          },
        })

      case '/subscribe':
        return this.sendMessage(chatId, 'Подписки:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть подписки',
                  web_app: { url: `${config.frontendUrl}/subscription` },
                },
              ],
            ],
          },
        })

      case '/campaigns':
        return this.sendMessage(chatId, '🎯 Целевые кампании:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть кампании',
                  web_app: { url: `${config.frontendUrl}/campaigns` },
                },
              ],
              [
                {
                  text: '➕ Создать кампанию',
                  web_app: { url: `${config.frontendUrl}/campaigns/create` },
                },
              ],
            ],
          },
        })

      case '/partners':
        return this.sendMessage(chatId, '🤝 Фонды-партнёры:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть каталог фондов',
                  web_app: { url: `${config.frontendUrl}/partners` },
                },
              ],
              [
                {
                  text: '📝 Оставить заявку на партнёрство',
                  web_app: { url: `${config.frontendUrl}/partners/apply` },
                },
              ],
            ],
          },
        })

      case '/help':
        return this.sendMessage(chatId, `📖 <b>Помощь по использованию бота</b>

<b>Доступные команды:</b>
/start - Главное меню
/donate - Пожертвовать
/support - Поддержать проект
/zakat - Калькулятор закята
/subscribe - Подписки
/campaigns - Целевые кампании
/partners - Фонды-партнёры
/help - Эта справка

<b>Основные функции:</b>
💰 <b>Пожертвование</b> - разовое пожертвование в выбранный фонд
📅 <b>Подписка</b> - регулярное ежемесячное пожертвование
📊 <b>Закят</b> - калькулятор для расчета закята
🎯 <b>Кампании</b> - целевые сборы
📖 <b>История</b> - ваши пожертвования и подписки

<b>Мини-приложение:</b>
Нажмите кнопку "🌐 Открыть Mini App" для доступа к полному функционалу платформы.`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🌐 Открыть Mini App', web_app: { url: `${config.frontendUrl}` } },
              ],
              [
                { text: '◀️ Назад', callback_data: 'start' },
              ],
            ],
          },
        })

      case '/info':
        try {
          const botInfo = await this.getMe()
          return this.sendMessage(chatId, `ℹ️ <b>Информация о боте</b>

<b>Название:</b> ${botInfo.result.first_name}
<b>Username:</b> @${botInfo.result.username}
<b>Версия:</b> 1.0.0

<b>О платформе:</b>
Nisab - платформа для садака и закята. Мы помогаем мусульманам делать пожертвования в проверенные фонды и рассчитывать закят.

<b>Контакты:</b>
Для поддержки используйте команду /help или откройте Mini App.`, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🌐 Открыть Mini App', web_app: { url: `${config.frontendUrl}` } },
                ],
              ],
            },
          })
        } catch (error) {
          logger.error('Failed to get bot info:', error)
          return this.sendMessage(chatId, 'Информация о боте временно недоступна.')
        }

      default:
        return this.sendMessage(chatId, 'Неизвестная команда. Используйте /start для начала или /help для справки.', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🏠 Главное меню', callback_data: 'start' },
                { text: '📖 Помощь', callback_data: 'help' },
              ],
            ],
          },
        })
    }
  }

  /**
   * Обрабатывает callback_query (нажатия на inline-кнопки)
   */
  async handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
    const { from, data, id } = callbackQuery

    try {
      // Ответ на callback_query (убирает загрузку)
      await this.answerCallbackQuery(id, '')

      // Обработка различных callback_data
      if (data.startsWith('donate')) {
        await this.handleCommand(from.id, '/donate')
      } else if (data.startsWith('support:')) {
        const amount = data.split(':')[1]
        await this.sendMessage(from.id, `Открытие формы поддержки на ${amount} ₽...`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Перейти к оплате',
                  web_app: { url: `${config.frontendUrl}/support?amount=${amount}` },
                },
              ],
            ],
          },
        })
      } else if (data.startsWith('donate:fund=')) {
        // Формат: donate:fund=<id>;sum=500
        const params = new URLSearchParams(data.replace('donate:', '').replace(/;/g, '&'))
        const fundId = params.get('fund')
        const sum = params.get('sum')
        
        await this.sendMessage(from.id, `Открытие формы пожертвования...`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Перейти к оплате',
                  web_app: { url: `${config.frontendUrl}/donate?fund=${fundId}&amount=${sum || ''}` },
                },
              ],
            ],
          },
        })
      } else if (data.startsWith('sub:plan=')) {
        // Формат: sub:plan=premium;period=P12M
        const params = new URLSearchParams(data.replace('sub:', '').replace(/;/g, '&'))
        const plan = params.get('plan')
        const period = params.get('period')
        
        await this.sendMessage(from.id, `Открытие формы подписки...`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Перейти к подписке',
                  web_app: { url: `${config.frontendUrl}/subscription?plan=${plan}&period=${period}` },
                },
              ],
            ],
          },
        })
      } else if (data.startsWith('campaign:join:')) {
        const campaignId = data.replace('campaign:join:', '')
        await this.sendMessage(from.id, `Открытие кампании...`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Присоединиться к кампании',
                  web_app: { url: `${config.frontendUrl}/campaigns/${campaignId}` },
                },
              ],
            ],
          },
        })
      } else if (data === 'zakat:calc') {
        await this.sendMessage(from.id, 'Открытие калькулятора закята...', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть калькулятор',
                  web_app: { url: `${config.frontendUrl}/zakat` },
                },
              ],
            ],
          },
        })
      } else if (data.startsWith('subscription')) {
        await this.handleCommand(from.id, '/subscribe')
      } else if (data === 'zakat') {
        await this.handleCommand(from.id, '/zakat')
      } else if (data === 'campaigns') {
        await this.handleCommand(from.id, '/campaigns')
      } else if (data === 'partners') {
        await this.handleCommand(from.id, '/partners')
      } else if (data === 'history') {
        await this.sendMessage(from.id, '📖 История пожертвований и подписок доступна в Mini App:', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Открыть историю',
                  web_app: { url: `${config.frontendUrl}/history` },
                },
              ],
            ],
          },
        })
      } else if (data === 'help') {
        await this.handleCommand(from.id, '/help')
      } else if (data === 'start') {
        await this.handleCommand(from.id, '/start')
      }
    } catch (error: any) {
      logger.error('Failed to handle callback query:', error)
    }
  }

  /**
   * Ответ на callback_query
   */
  async answerCallbackQuery(callbackQueryId: string, text?: string) {
    try {
      await this.client.post('/answerCallbackQuery', {
        callback_query_id: callbackQueryId,
        text,
      })
    } catch (error: any) {
      logger.error('Failed to answer callback query:', error)
    }
  }

  /**
   * Установка webhook
   */
  async setWebhook(url: string) {
    try {
      const response = await this.client.post('/setWebhook', {
        url,
      })
      return response.data
    } catch (error: any) {
      logger.error('Failed to set webhook:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Получение информации о webhook
   */
  async getWebhookInfo() {
    try {
      const response = await this.client.get('/getWebhookInfo')
      return response.data
    } catch (error: any) {
      logger.error('Failed to get webhook info:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Удаление webhook
   */
  async deleteWebhook() {
    try {
      const response = await this.client.post('/deleteWebhook', { drop_pending_updates: true })
      return response.data
    } catch (error: any) {
      logger.error('Failed to delete webhook:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * Получение информации о боте
   */
  async getMe() {
    try {
      const response = await this.client.get('/getMe')
      return response.data
    } catch (error: any) {
      logger.error('Failed to get bot info:', error.response?.data || error.message)
      throw error
    }
  }
}

export const telegramBot = new TelegramBot()

