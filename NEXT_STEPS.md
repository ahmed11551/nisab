# Что дальше делать?

## 🎯 Следующие шаги после загрузки в GitHub

### ✅ Шаг 1: Настройка переменных окружения

#### Backend (.env)

Создайте файл `backend/.env`:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://nisab:nisab_password@localhost:5432/nisab_db

# Redis (опционально)
REDIS_URL=redis://localhost:6379

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBAPP_SECRET=your_webapp_secret_here

# Payments - YooKassa
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key

# Payments - CloudPayments
CLOUDPAYMENTS_PUBLIC_ID=your_public_id
CLOUDPAYMENTS_SECRET_KEY=your_secret_key

# External API
API_TOKEN=test_token_123
BOT_E_REPLIKA_URL=https://bot.e-replika.ru
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=your_jwt_secret_change_in_production

# Admin
ADMIN_API_KEY=your_admin_key

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Nisab
VITE_TELEGRAM_BOT_NAME=your_bot_name
```

### ✅ Шаг 2: Запуск локально для разработки

#### Вариант A: Docker Compose (рекомендуется)

```bash
# Запустить все сервисы
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановить
docker-compose down
```

#### Вариант B: Локально

```bash
# 1. Установить зависимости
npm run install:all

# 2. Запустить PostgreSQL (если не через Docker)
# Создать базу данных
createdb nisab_db

# 3. Запустить миграции
cd backend
npm run migrate

# 4. Запустить seed (опционально)
npm run seed

# 5. Запустить backend
npm run dev:backend

# 6. В новом терминале - запустить frontend
npm run dev:frontend
```

### ✅ Шаг 3: Настройка базы данных

```bash
# Создать базу данных PostgreSQL
createdb nisab_db

# Или через psql
psql -U postgres
CREATE DATABASE nisab_db;
CREATE USER nisab WITH PASSWORD 'nisab_password';
GRANT ALL PRIVILEGES ON DATABASE nisab_db TO nisab;
\q

# Запустить миграции
cd backend
npm run migrate

# Заполнить тестовыми данными (опционально)
npm run seed
```

### ✅ Шаг 4: Настройка Telegram Bot

1. **Создать бота через @BotFather:**
   ```
   /newbot
   Название бота: Nisab
   Username: your_bot_name_bot
   ```

2. **Создать Mini App через @BotFather:**
   ```
   /newapp
   Выбрать созданный бот
   Название приложения: Nisab
   Короткое описание: Садака-Пасс
   URL: https://your-domain.com (или http://localhost:5173 для разработки)
   ```

3. **Получить секрет WebApp:**
   - Сохранить в `backend/.env` как `TELEGRAM_WEBAPP_SECRET`

4. **Настроить webhook:**
   ```bash
   # После запуска backend сервера
   curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/v1/telegram/webhook"}'
   ```

### ✅ Шаг 5: Настройка платежных систем

#### YooKassa (для РФ карт)

1. Зарегистрироваться на https://yookassa.ru
2. Получить `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`
3. Добавить в `backend/.env`
4. Настроить webhook URL: `https://your-domain.com/api/v1/payments/webhook/yookassa`

#### CloudPayments (для международных карт)

1. Зарегистрироваться на https://cloudpayments.ru
2. Получить `CLOUDPAYMENTS_PUBLIC_ID` и `CLOUDPAYMENTS_SECRET_KEY`
3. Добавить в `backend/.env`
4. Настроить webhook URL: `https://your-domain.com/api/v1/payments/webhook/cloudpayments`

### ✅ Шаг 6: Развертывание Frontend на Vercel

1. **Подключить репозиторий к Vercel:**
   - Зайти на https://vercel.com
   - Импортировать репозиторий `ahmed11551/nisab`
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Настроить переменные окружения в Vercel:**
   ```
   VITE_API_URL=https://your-backend-domain.com
   VITE_APP_NAME=Nisab
   VITE_TELEGRAM_BOT_NAME=your_bot_name
   ```

3. **Деплой:**
   - Vercel автоматически задеплоит после push в `main`
   - Получить URL для Mini App (например: `https://nisab.vercel.app`)

### ✅ Шаг 7: Развертывание Backend

#### Вариант A: Railway / Render / DigitalOcean

1. **Railway:**
   ```bash
   # Установить Railway CLI
   npm i -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Render:**
   - Зайти на https://render.com
   - Создать новый Web Service
   - Подключить репозиторий
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Переменные окружения:**
   - Добавить все переменные из `backend/.env`
   - Обязательно: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBAPP_SECRET`

#### Вариант B: Docker на сервере

```bash
# На сервере
git clone https://github.com/ahmed11551/nisab.git
cd nisab
docker-compose -f docker-compose.prod.yml up -d
```

### ✅ Шаг 8: Настройка домена и SSL

1. **Получить домен:**
   - Купить домен (например: `nisab.app`)
   - Или использовать поддомен

2. **Настроить DNS:**
   - Frontend (Vercel): автоматически через Vercel
   - Backend: указать A-запись на IP сервера

3. **SSL сертификат:**
   - Vercel: автоматически
   - Backend: настроить через Let's Encrypt или использовать прокси (nginx)

### ✅ Шаг 9: Обновить URL Mini App в Telegram

После получения production URL:

1. Через @BotFather:
   ```
   /myapps
   Выбрать ваше приложение
   Edit app
   URL: https://your-production-domain.com
   ```

2. Обновить `CORS_ORIGIN` в `backend/.env`:
   ```
   CORS_ORIGIN=https://your-production-domain.com
   ```

### ✅ Шаг 10: Тестирование

#### Локальное тестирование:

1. **Запустить проект:**
   ```bash
   npm run dev
   ```

2. **Проверить endpoints:**
   ```bash
   # Health check
   curl http://localhost:3000/health

   # API endpoints
   curl http://localhost:3000/api/v1/funds
   ```

3. **Тестировать в Telegram:**
   - Открыть Mini App в Telegram
   - Проверить навигацию
   - Протестировать формы

#### Production тестирование:

1. Проверить все endpoints через Postman/Insomnia
2. Протестировать платежи (test режим)
3. Проверить webhooks
4. Протестировать Telegram Bot команды

### ✅ Шаг 11: Мониторинг и логирование

1. **Настроить логирование:**
   - Winston уже настроен в `backend/src/utils/logger.ts`
   - Логи сохраняются в `logs/` директории

2. **Мониторинг (опционально):**
   - Подключить Sentry для отслеживания ошибок
   - Настроить Uptime Robot для проверки доступности
   - Добавить аналитику (Google Analytics / Yandex Metrika)

### ✅ Шаг 12: Безопасность

1. **Обновить секретные ключи:**
   - ✅ `JWT_SECRET` - использовать криптографически стойкий ключ
   - ✅ `TELEGRAM_WEBAPP_SECRET` - получить от Telegram
   - ✅ `ADMIN_API_KEY` - сильный ключ для админ панели

2. **Настроить rate limiting:**
   - Добавить rate limit middleware (уже есть в планах)

3. **Проверить CORS:**
   - ✅ Только разрешенные домены в `CORS_ORIGIN`

### ✅ Шаг 13: Документация

1. **Обновить README.md:**
   - Добавить скриншоты
   - Обновить инструкции по установке

2. **API документация:**
   - Использовать Swagger/OpenAPI (опционально)
   - Документация в `docs/API.md` уже есть

## 📋 Чеклист готовности к production

- [ ] Переменные окружения настроены
- [ ] База данных создана и миграции выполнены
- [ ] Telegram Bot создан и настроен
- [ ] Mini App создано в @BotFather
- [ ] Платежные системы подключены (test режим)
- [ ] Frontend задеплоен на Vercel
- [ ] Backend задеплоен на сервер
- [ ] Webhooks настроены для платежных систем
- [ ] Telegram webhook настроен
- [ ] Домен и SSL настроены
- [ ] CORS настроен для production домена
- [ ] Тестирование выполнено
- [ ] Логирование работает
- [ ] Безопасность проверена

## 🚀 Быстрый старт (минимальная конфигурация)

Для быстрого запуска только для тестирования:

```bash
# 1. Установить зависимости
npm run install:all

# 2. Создать .env файлы (минимальная конфигурация)
# backend/.env - только DATABASE_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBAPP_SECRET
# frontend/.env - только VITE_API_URL

# 3. Запустить PostgreSQL через Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=nisab_password -e POSTGRES_DB=nisab_db postgres

# 4. Запустить миграции
cd backend && npm run migrate

# 5. Запустить dev серверы
npm run dev
```

## 📞 Поддержка

Если возникнут проблемы:
1. Проверить логи: `backend/logs/` или `docker-compose logs`
2. Проверить документацию: `docs/`
3. Проверить чеклист: `CHECKLIST.md`
4. Проверить статус: `PROJECT_STATUS.md`

## 🎉 Готово!

После выполнения всех шагов проект будет полностью развернут и готов к использованию!

