# Быстрый старт проекта Nisab

## Шаг 1: Установка зависимостей

```bash
# Проверьте версии
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Установка всех зависимостей
npm run install:all
```

## Шаг 2: Настройка базы данных

### Вариант A: Использование Docker (рекомендуется)

```bash
# Запуск PostgreSQL, Redis, Elasticsearch
docker-compose up -d postgres redis elasticsearch

# Ждём пока сервисы запустятся (10-15 секунд)
```

### Вариант B: Локальная установка

```bash
# Создание базы данных
createdb nisab_db

# Или через psql
psql -U postgres -c "CREATE DATABASE nisab_db;"
```

## Шаг 3: Настройка переменных окружения

### Backend

Создайте файл `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://nisab:nisab_password@localhost:5432/nisab_db

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBAPP_SECRET=your_webapp_secret

# Payments
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
CLOUDPAYMENTS_PUBLIC_ID=your_public_id
CLOUDPAYMENTS_SECRET_KEY=your_secret_key

# External API
API_TOKEN=test_token_123
ELASTICSEARCH_URL=http://localhost:9200
BOT_E_REPLIKA_URL=https://bot.e-replika.ru

# JWT
JWT_SECRET=your_jwt_secret

# Admin
ADMIN_API_KEY=your_admin_key
```

### Frontend

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Nisab
VITE_TELEGRAM_BOT_NAME=your_bot_name
```

## Шаг 4: Запуск миграций и seed

```bash
cd backend

# Миграции (создание таблиц)
npm run migrate

# Seed (тестовые данные)
npm run seed
```

## Шаг 5: Запуск проекта

### Разработка

```bash
# Запуск frontend и backend одновременно
npm run dev

# Или отдельно:
npm run dev:frontend  # Порт 5173
npm run dev:backend  # Порт 3000
```

### Production

```bash
# Сборка
npm run build

# Запуск backend
cd backend
npm start

# Запуск frontend (через nginx или другой веб-сервер)
cd frontend
npm run preview
```

## Шаг 6: Проверка работы

1. **Backend API:** http://localhost:3000/health
2. **Frontend:** http://localhost:5173
3. **API документация:** См. [docs/API.md](./docs/API.md)

## Основные команды

```bash
# Установка зависимостей
npm run install:all

# Разработка
npm run dev

# Сборка
npm run build

# Миграции
cd backend && npm run migrate

# Seed (тестовые данные)
cd backend && npm run seed

# Тесты (когда будут добавлены)
cd backend && npm test
```

## Docker (опционально)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## Структура проекта

```
nisab/
├── frontend/          # Telegram Mini App (React/TypeScript)
├── backend/           # API Server (Node.js/Express/TypeScript)
├── docs/              # Документация
└── docker-compose.yml # Docker конфигурация
```

## Следующие шаги

1. Настройте Telegram Bot через @BotFather
2. Получите ключи от платежных систем (YooKassa, CloudPayments)
3. Настройте Elasticsearch (если используется)
4. Прочитайте [README.md](./README.md) для подробной информации

## Проблемы?

См. [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) или создайте Issue в репозитории.

