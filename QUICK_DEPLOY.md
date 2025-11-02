# 🚀 Быстрое развертывание на GitHub и Vercel

## Шаг 1: Загрузка в GitHub (5 минут)

```bash
# 1. Инициализируйте Git (если еще не сделано)
git init

# 2. Добавьте все файлы
git add .

# 3. Создайте первый коммит
git commit -m "Initial commit: Nisab Sadaqa Pass"

# 4. Создайте репозиторий на GitHub (https://github.com/new)
#    - Repository name: nisab-sadaqa
#    - Description: "Telegram Mini App for Sadaqa donations, subscriptions, and Zakat calculator"
#    - НЕ создавайте README, .gitignore, license (они уже есть)

# 5. Подключите локальный репозиторий к GitHub
git remote add origin https://github.com/YOUR_USERNAME/nisab-sadaqa.git
git branch -M main
git push -u origin main
```

**✅ Готово!** Код теперь в GitHub.

## Шаг 2: Развертывание Frontend на Vercel (5 минут)

### Через Vercel Dashboard:

1. Откройте https://vercel.com
2. **Add New...** → **Project**
3. Импортируйте репозиторий из GitHub
4. Настройте проект:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. Добавьте переменные окружения:
   ```
   VITE_API_URL = https://your-backend-url.com (пока пусто, обновите после деплоя backend)
   VITE_APP_NAME = Nisab
   ```
6. **Deploy**

**✅ Готово!** Frontend задеплоен. URL будет: `https://nisab-sadaqa.vercel.app`

## Шаг 3: Развертывание Backend (10 минут)

### Вариант A: Railway (рекомендуется)

1. Откройте https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Выберите репозиторий `nisab-sadaqa`
4. Настройте:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
5. **Add Database** → **PostgreSQL**
6. Добавьте переменные окружения:
   ```
   NODE_ENV = production
   DATABASE_URL = ${{Postgres.DATABASE_URL}} (автоматически)
   TELEGRAM_BOT_TOKEN = your_bot_token
   TELEGRAM_WEBAPP_SECRET = your_webapp_secret
   CORS_ORIGIN = https://nisab-sadaqa.vercel.app
   FRONTEND_URL = https://nisab-sadaqa.vercel.app
   # Остальные переменные из backend/.env.example
   ```
7. Сохраните URL backend (например: `https://nisab-backend.railway.app`)

### Вариант B: Render

1. Откройте https://render.com
2. **New** → **Web Service**
3. Подключите GitHub репозиторий
4. Настройки:
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. Добавьте PostgreSQL и переменные окружения
6. Deploy

**✅ Готово!** Backend задеплоен.

## Шаг 4: Настройка после развертывания (5 минут)

### 4.1. Обновите VITE_API_URL в Vercel

1. Vercel Dashboard → Ваш проект → Settings → Environment Variables
2. Обновите `VITE_API_URL` на реальный backend URL
3. **Redeploy** проект

### 4.2. Запустите миграции

**Railway:**
```bash
# Установите Railway CLI
npm i -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Запустите миграции
railway run npm run migrate
```

**Render:**
- Используйте Shell в Dashboard для запуска миграций

### 4.3. Настройте Telegram Bot Webhook

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/v1/telegram/webhook"}'
```

### 4.4. Настройте Mini App в @BotFather

1. Откройте @BotFather в Telegram
2. Отправьте `/newapp`
3. Укажите Web App URL: `https://nisab-sadaqa.vercel.app`
4. Сохраните секрет и добавьте в backend переменные

**✅ Готово!** Проект полностью настроен!

## 📋 Чеклист

- [ ] Код загружен в GitHub
- [ ] Frontend развернут на Vercel
- [ ] Backend развернут (Railway/Render)
- [ ] Переменные окружения настроены
- [ ] Миграции запущены
- [ ] Telegram Bot webhook настроен
- [ ] Mini App настроена в @BotFather
- [ ] VITE_API_URL обновлен в Vercel

## ⚠️ Важно

1. **Обновите `VITE_API_URL`** в Vercel после деплоя backend
2. **Используйте реальные ключи** для production (не тестовые)
3. **Настройте платежные webhooks** в личных кабинетах

## 🆘 Проблемы?

- **Vercel build fails:** Проверьте Build Command и Root Directory
- **Backend не отвечает:** Проверьте переменные окружения и миграции
- **Telegram Bot не работает:** Проверьте webhook URL и токен

## ✅ Готово!

После выполнения всех шагов проект будет полностью развернут и готов к использованию!

**📖 Подробные инструкции:**
- [GIT_INSTRUCTIONS.md](./GIT_INSTRUCTIONS.md) - Детальная инструкция по Git
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) - Полная инструкция по Vercel
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Детальный чеклист

