import dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://nisab:nisab_password@localhost:5432/nisab_db',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    webappSecret: process.env.TELEGRAM_WEBAPP_SECRET || '',
  },

  payments: {
    yookassa: {
      shopId: process.env.YOOKASSA_SHOP_ID || '',
      secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    },
    cloudpayments: {
      publicId: process.env.CLOUDPAYMENTS_PUBLIC_ID || '',
      secretKey: process.env.CLOUDPAYMENTS_SECRET_KEY || '',
    },
  },

  external: {
    apiToken: process.env.API_TOKEN || 'test_token_123',
    elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    botEReplikaUrl: process.env.BOT_E_REPLIKA_URL || 'https://bot.e-replika.ru',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '7d',
  },

  admin: {
    apiKey: process.env.ADMIN_API_KEY || '',
  },
}

