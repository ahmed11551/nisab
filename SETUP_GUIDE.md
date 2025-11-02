# Руководство по настройке и запуску проекта Nisab

## Шаг 1: Установка зависимостей

### Предварительные требования
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis (опционально, для кеширования)
- Elasticsearch (опционально, для поиска фондов)

### Установка

```bash
# Установка всех зависимостей
npm run install:all
```

Если возникнут ошибки, установите зависимости отдельно:

```bash
# Root зависимости
npm install

# Frontend зависимости
cd frontend
npm install
cd ..

# Backend зависимости
cd backend
npm install
cd ..
```

## Шаг 2: Настройка базы данных

### Вариант A: Docker (рекомендуется для разработки)

```bash
# Запуск PostgreSQL, Redis, Elasticsearch
docker-compose up -d postgres redis elasticsearch

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs postgres
```

### Вариант B: Локальная установка PostgreSQL

```bash
# Windows (через psql)
psql -U postgres -c "CREATE DATABASE nisab_db;"
psql -U postgres -c "CREATE USER nisab WITH PASSWORD 'nisab_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nisab_db TO nisab;"

# Linux/Mac
createdb nisab_db
```

## Шаг 3: Настройка переменных окружения

### Backend (.env)

Создайте файл `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://nisab:nisab_password@localhost:5432/nisab_db

# Redis (опционально)
REDIS_URL=redis://localhost:6379

# Telegram Bot
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
ELASTICSEARCH_URL=http://localhost:9200
BOT_E_REPLIKA_URL=https://bot.e-replika.ru

# JWT
JWT_SECRET=your_jwt_secret_change_in_production

# Admin
ADMIN_API_KEY=your_admin_key

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Nisab
VITE_TELEGRAM_BOT_NAME=your_bot_name
```

## Шаг 4: Настройка Telegram Bot

### 4.1. Создание бота через @BotFather

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен в `backend/.env` как `TELEGRAM_BOT_TOKEN`

### 4.2. Настройка WebApp

1. В @BotFather выберите созданный бот
2. Отправьте команду `/newapp`
3. Создайте Mini App и получите URL
4. Сохраните секрет в `backend/.env` как `TELEGRAM_WEBAPP_SECRET`

### 4.3. Установка webhook

После запуска backend сервера:

```bash
# Замените YOUR_BOT_TOKEN и YOUR_DOMAIN на реальные значения
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_DOMAIN.com/api/v1/telegram/webhook"}'
```

Или используйте эндпоинт для получения команды:
```bash
curl "http://localhost:3000/api/v1/telegram/set-webhook?url=https://YOUR_DOMAIN.com/api/v1/telegram/webhook"
```

## Шаг 5: Настройка платежных систем

### 5.1. YooKassa

1. Зарегистрируйтесь на https://yookassa.ru
2. Создайте магазин
3. Получите `Shop ID` и `Secret Key`
4. Добавьте их в `backend/.env`

### 5.2. CloudPayments

1. Зарегистрируйтесь на https://cloudpayments.ru
2. Создайте кабинет
3. Получите `Public ID` и `Secret Key`
4. Добавьте их в `backend/.env`

### 5.3. Настройка webhooks

#### YooKassa
1. В личном кабинете YooKassa перейдите в настройки магазина
2. Добавьте URL: `https://YOUR_DOMAIN.com/api/v1/payments/webhook/yookassa`

#### CloudPayments
1. В личном кабинете CloudPayments перейдите в настройки
2. Добавьте URL: `https://YOUR_DOMAIN.com/api/v1/payments/webhook/cloudpayments`

## Шаг 6: Запуск миграций

```bash
cd backend

# Создание таблиц
npm run migrate

# Заполнение тестовыми данными (опционально)
npm run seed
```

## Шаг 7: Запуск проекта

### Разработка

```bash
# Из корневой директории
npm run dev

# Или отдельно:
npm run dev:frontend  # Frontend на http://localhost:5173
npm run dev:backend   # Backend на http://localhost:3000
```

### Production

```bash
# Сборка
npm run build

# Запуск backend
cd backend
npm start

# Frontend собирается в статические файлы
cd frontend
npm run build
# Затем развернуть dist/ через nginx или другой веб-сервер
```

## Шаг 8: Проверка работы

### 8.1. Health Check

```bash
curl http://localhost:3000/health
# Должен вернуть: {"status":"ok","timestamp":"..."}
```

### 8.2. Проверка базы данных

```bash
# Подключение к PostgreSQL
psql -U nisab -d nisab_db

# Проверка таблиц
\dt

# Проверка данных
SELECT * FROM users LIMIT 5;
SELECT * FROM funds LIMIT 5;
```

### 8.3. Проверка Elasticsearch

```bash
# Проверка здоровья
curl http://localhost:9200/_cluster/health

# Проверка индекса
curl http://localhost:9200/funds/_search?pretty
```

### 8.4. Тестирование Telegram Bot

1. Найдите своего бота в Telegram
2. Отправьте `/start`
3. Бот должен ответить приветственным сообщением с кнопками

### 8.5. Тестирование Mini App

1. Откройте бота в Telegram
2. Нажмите на кнопку "Открыть Mini App" или используйте команду `/sadaqa`
3. Mini App должна открыться в Telegram

## Шаг 9: Типичные проблемы и решения

### Проблема: База данных не подключается

**Решение:**
```bash
# Проверьте, что PostgreSQL запущен
docker-compose ps postgres

# Проверьте DATABASE_URL в backend/.env
# Формат: postgresql://user:password@host:port/database
```

### Проблема: Frontend не может подключиться к Backend

**Решение:**
1. Проверьте `VITE_API_URL` в `frontend/.env`
2. Проверьте CORS настройки в `backend/src/index.ts`
3. Убедитесь, что backend запущен на правильном порту

### Проблема: Telegram webhook не работает

**Решение:**
1. Убедитесь, что backend доступен извне (для production нужен HTTPS)
2. Проверьте правильность URL webhook
3. Проверьте логи backend для ошибок

### Проблема: Elasticsearch недоступен

**Решение:**
- Elasticsearch опционален, приложение работает без него (fallback на БД)
- Проверьте, что Elasticsearch запущен: `docker-compose ps elasticsearch`
- Проверьте URL в `ELASTICSEARCH_URL`

## Шаг 10: Следующие шаги

1. **Добавьте реальные данные:**
   - Создайте реальные фонды в базе данных
   - Настройте тарифы подписок
   - Добавьте тестовые кампании

2. **Настройте production:**
   - Используйте HTTPS для всех внешних URL
   - Настройте мониторинг (Sentry, Prometheus)
   - Настройте резервное копирование БД

3. **Протестируйте платежи:**
   - Используйте тестовые ключи для YooKassa и CloudPayments
   - Проверьте webhooks
   - Протестируйте различные сценарии

4. **Настройте Telegram Bot:**
   - Добавьте больше команд
   - Настройте inline-кнопки
   - Добавьте админ-панель для модерации

## 📚 Полезные команды

```bash
# Просмотр логов backend
cd backend
npm run dev  # Логи в консоли

# Просмотр логов Docker
docker-compose logs -f

# Очистка базы данных (ОСТОРОЖНО!)
cd backend
psql -U nisab -d nisab_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
npm run seed

# Пересоздание Docker контейнеров
docker-compose down -v
docker-compose up -d

# Проверка синтаксиса TypeScript
cd backend
npm run build  # Проверит на ошибки

cd frontend
npm run build  # Проверит на ошибки
```

## 🎯 Готово!

Проект должен быть запущен и готов к использованию. Если возникнут проблемы, проверьте:
- Логи backend и frontend
- Переменные окружения
- Статус Docker контейнеров
- Подключение к базам данных

