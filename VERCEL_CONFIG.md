# Конфигурация Vercel

## Project ID
`prj_jJqZBOEhjvte66HAfabgx3ccBcY4`

Этот Project ID автоматически используется при деплое через GitHub.

## Настройка в Vercel Dashboard

### 1. Переменные окружения для Frontend
В Settings → Environment Variables добавьте:

```
VITE_API_URL = https://your-backend-domain.com
VITE_APP_NAME = Nisab
VITE_TELEGRAM_BOT_NAME = your_bot_name
```

### 2. Переменные окружения для Backend (если деплоите на Vercel)
```
NODE_ENV = production
DATABASE_URL = your_database_url
TELEGRAM_BOT_TOKEN = your_bot_token
TELEGRAM_WEBAPP_SECRET = your_webapp_secret
YOOKASSA_SHOP_ID = your_actual_yookassa_shop_id
YOOKASSA_SECRET_KEY = your_yookassa_secret_key
CORS_ORIGIN = https://your-frontend.vercel.app
FRONTEND_URL = https://your-frontend.vercel.app
```

## Важно
- Project ID используется автоматически при подключении через GitHub
- НЕ нужно добавлять его в `.env` файлы
- Для управления через CLI используйте `vercel link --project=prj_jJqZBOEhjvte66HAfabgx3ccBcY4`

