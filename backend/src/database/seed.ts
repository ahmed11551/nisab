import { sequelize } from './index'
import { User, Fund, Campaign } from './models'
import { logger } from '../utils/logger'
import { config } from '../config'

/**
 * Заполняет базу данных тестовыми данными
 * Используется только для разработки
 */
async function seed() {
  try {
    if (config.env === 'production') {
      logger.warn('Seeding is disabled in production')
      return
    }

    await sequelize.authenticate()
    logger.info('Database connection established')

    // Очистка существующих данных (опционально)
    // await User.destroy({ where: {}, truncate: true })
    // await Fund.destroy({ where: {}, truncate: true })

    // Создание тестовых фондов
    const funds = await Fund.bulkCreate([
      {
        name: 'Фонд помощи сиротам',
        country_code: 'RU',
        purposes: ['orphans'],
        categories: ['orphans'],
        verified: true,
        partner_enabled: true,
        active: true,
        short_desc: 'Помощь детям-сиротам и детям, оставшимся без попечения родителей',
        website: 'https://example.org',
        social_links: ['https://vk.com/example'],
      },
      {
        name: 'Международный фонд помощи',
        country_code: 'RU',
        purposes: ['intl', 'mosque'],
        categories: ['intl', 'mosque'],
        verified: true,
        partner_enabled: true,
        active: true,
        short_desc: 'Международная благотворительная помощь',
        website: 'https://example.org',
        social_links: [],
      },
      {
        name: 'Фонд развития мечетей',
        country_code: 'KZ',
        purposes: ['mosque'],
        categories: ['mosque'],
        verified: true,
        partner_enabled: true,
        active: true,
        short_desc: 'Развитие исламской инфраструктуры',
        website: 'https://example.org',
        social_links: [],
      },
    ])

    logger.info(`Created ${funds.length} funds`)

    // Создание тестовых пользователей
    const users = await User.bulkCreate([
      {
        tg_id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        locale: 'ru',
      },
    ])

    logger.info(`Created ${users.length} users`)

    // Создание тестовых кампаний
    const campaigns = await Campaign.bulkCreate([
      {
        title: 'Сбор на ремонт мечети в Казани',
        description: 'Собираем средства на ремонт мечети в центре Казани',
        category: 'mosque',
        goal_amount: 500000,
        collected_amount: 125000,
        owner_id: users[0].id,
        fund_id: funds[0].id,
        country_code: 'RU',
        status: 'active',
      },
    ])

    logger.info(`Created ${campaigns.length} campaigns`)

    await sequelize.close()
    logger.info('Seeding completed')
  } catch (error) {
    logger.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()

