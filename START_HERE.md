# 🚀 С чего начать?

## ✅ Проект загружен в GitHub

**Репозиторий:** https://github.com/ahmed11551/nisab.git

## 🎯 Следующие 5 шагов

### 1️⃣ Создать файлы .env

```bash
# Backend
cp backend/.env.example backend/.env
# Отредактировать backend/.env - добавить реальные значения

# Frontend
cp frontend/.env.example frontend/.env
# Отредактировать frontend/.env - добавить реальные значения
```

### 2️⃣ Запустить PostgreSQL

**Вариант A: Docker (рекомендуется)**
```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=nisab_password \
  -e POSTGRES_DB=nisab_db \
  --name nisab_postgres \
  postgres:14
```

**Вариант B: Локально**
```bash
createdb nisab_db
```

### 3️⃣ Установить зависимости

```bash
npm run install:all
```

### 4️⃣ Запустить миграции

```bash
cd backend
npm run migrate
```

### 5️⃣ Запустить проект

```bash
# В корне проекта
npm run dev
```

**Проверить:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/health

## 📋 Минимальные настройки для теста

Для быстрого теста достаточно:

1. **backend/.env:**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nisab_db
   CORS_ORIGIN=http://localhost:5173
   API_TOKEN=test_token_123
   BOT_E_REPLIKA_URL=https://bot.e-replika.ru
   ```

2. **frontend/.env:**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

Остальные переменные можно добавить позже.

## 🔜 После локального запуска

1. **Настроить Telegram Bot**
   - Создать бота через @BotFather
   - Создать Mini App
   - Получить токены

2. **Подключить платежи** (test режим)
   - YooKassa
   - CloudPayments

3. **Деплой**
   - Frontend на Vercel
   - Backend на Railway/Render

## 📖 Документация

- **Подробные инструкции:** [NEXT_STEPS.md](./NEXT_STEPS.md)
- **Быстрый старт:** [QUICK_START.md](./QUICK_START.md)
- **План действий:** [ACTION_PLAN.md](./ACTION_PLAN.md)
- **Настройка:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## ⚠️ Важно

1. **Не коммитьте файлы .env в Git!**
   - Они уже в `.gitignore`

2. **Для production:**
   - Используйте сильные секретные ключи
   - Настройте HTTPS
   - Включите rate limiting

## 🆘 Проблемы?

1. Проверьте логи: `backend/logs/`
2. Проверьте документацию: `docs/`
3. Проверьте чеклист: `CHECKLIST.md`

---

**Начните с шага 1!** 🎉
