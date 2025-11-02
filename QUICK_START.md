# 🚀 Быстрый старт

## Минимальная настройка для запуска

### 1. Клонировать репозиторий

```bash
git clone https://github.com/ahmed11551/nisab.git
cd nisab
```

### 2. Установить зависимости

```bash
npm run install:all
```

### 3. Настроить переменные окружения

**backend/.env:**
```env
DATABASE_URL=postgresql://nisab:nisab_password@localhost:5432/nisab_db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBAPP_SECRET=your_webapp_secret
API_TOKEN=test_token_123
BOT_E_REPLIKA_URL=https://bot.e-replika.ru
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:3000
```

### 4. Запустить PostgreSQL

```bash
# Через Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=nisab_password -e POSTGRES_DB=nisab_db postgres

# Или установить локально и создать БД
createdb nisab_db
```

### 5. Запустить миграции

```bash
cd backend
npm run migrate
```

### 6. Запустить проект

```bash
# В корне проекта
npm run dev

# Или отдельно:
# Терминал 1 - Backend
npm run dev:backend

# Терминал 2 - Frontend
npm run dev:frontend
```

### 7. Проверить работу

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## 📝 Что дальше?

1. **Настроить Telegram Bot** - создать бота через @BotFather
2. **Настроить платежи** - подключить YooKassa/CloudPayments (test режим)
3. **Деплой** - развернуть на Vercel (frontend) и Railway/Render (backend)
4. **Тестирование** - протестировать все функции

Подробные инструкции: [NEXT_STEPS.md](./NEXT_STEPS.md)

