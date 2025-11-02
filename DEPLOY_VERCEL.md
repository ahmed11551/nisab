# Развертывание на Vercel - Детальная инструкция

## 🎯 Обзор

Проект состоит из двух частей:
- **Frontend** - Telegram Mini App (Vite + React) → Vercel
- **Backend** - Node.js API → Отдельный сервер (Railway/Render/DigitalOcean)

## 📋 Шаг 1: Подготовка к развертыванию

### 1.1. Убедитесь, что код в GitHub

```bash
# Проверьте статус
git status

# Если есть несохраненные изменения
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2. Создайте .env.example файлы

```bash
# Backend (уже есть через .env.example в коде)
# Frontend (нужно создать)
```

## 📋 Шаг 2: Развертывание Frontend на Vercel

### Вариант A: Через Vercel Dashboard (рекомендуется)

1. **Войдите в Vercel**
   - Откройте https://vercel.com
   - Войдите через GitHub

2. **Импортируйте проект**
   - Нажмите "Add New..." → "Project"
   - Выберите репозиторий `nisab-sadaqa`
   - Нажмите "Import"

3. **Настройте проект:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Добавьте переменные окружения:**
   ```
   VITE_API_URL = https://your-backend-domain.com
   VITE_APP_NAME = Nisab
   VITE_TELEGRAM_BOT_NAME = your_bot_name
   ```
   
   **Важно:** Замените `your-backend-domain.com` на реальный URL вашего backend сервера.

5. **Нажмите "Deploy"**

6. **После деплоя:**
   - Vercel создаст URL вида: `https://nisab-sadaqa.vercel.app`
   - Сохраните этот URL для настройки Telegram Bot

### Вариант B: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите
vercel login

# Перейдите в frontend директорию
cd frontend

# Задеплойте
vercel

# Следуйте инструкциям:
# - Link to existing project? No
# - Project name? nisab-frontend
# - Directory? ./
# - Override settings? No

# Для production деплоя
vercel --prod
```

## 📋 Шаг 3: Развертывание Backend

### Вариант A: Railway (рекомендуется)

1. **Создайте аккаунт**
   - Откройте https://railway.app
   - Войдите через GitHub

2. **Создайте проект**
   - New Project → Deploy from GitHub repo
   - Выберите `nisab-sadaqa`

3. **Настройте сервис:**
   - Нажмите на сервис
   - Settings → Root Directory: `backend`
   - Settings → Start Command: `npm start`

4. **Добавьте PostgreSQL:**
   - New → Database → PostgreSQL
   - Railway автоматически создаст переменную `DATABASE_URL`

5. **Добавьте переменные окружения:**
   ```
   NODE_ENV = production
   PORT = ${{PORT}}
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   TELEGRAM_BOT_TOKEN = your_bot_token
   TELEGRAM_WEBAPP_SECRET = your_webapp_secret
   YOOKASSA_SHOP_ID = your_shop_id
   YOOKASSA_SECRET_KEY = your_secret_key
   CLOUDPAYMENTS_PUBLIC_ID = your_public_id
   CLOUDPAYMENTS_SECRET_KEY = your_secret_key
   ELASTICSEARCH_URL = http://localhost:9200 (или ваш Elasticsearch URL)
   API_TOKEN = test_token_123
   JWT_SECRET = your_jwt_secret
   ADMIN_API_KEY = your_admin_key
   CORS_ORIGIN = https://your-frontend-domain.vercel.app
   FRONTEND_URL = https://your-frontend-domain.vercel.app
   ```

6. **Запустите миграции:**
   - В настройках сервиса → Variables → Add
   - Добавьте команду для миграций в Start Command:
   ```
   npm run migrate && npm start
   ```
   Или запустите миграции вручную через Railway CLI.

7. **Получите URL:**
   - Railway создаст URL вида: `https://nisab-backend.railway.app`
   - Сохраните этот URL

### Вариант B: Render

1. **Создайте аккаунт** на https://render.com

2. **Создайте Web Service:**
   - New → Web Service
   - Connect GitHub репозиторий
   - Настройки:
     ```
     Name: nisab-backend
     Root Directory: backend
     Environment: Node
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

3. **Добавьте PostgreSQL:**
   - New → PostgreSQL
   - Создайте базу данных
   - URL автоматически добавится в переменные

4. **Добавьте переменные окружения** (аналогично Railway)

5. **Создайте сервис** → Получите URL

### Вариант C: DigitalOcean App Platform

1. **Создайте аккаунт** на https://www.digitalocean.com

2. **App Platform → Create App**
   - Connect GitHub
   - Выберите репозиторий

3. **Настройте Backend:**
   - Component: Backend
   - Source Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`

4. **Добавьте PostgreSQL:**
   - Add Database → PostgreSQL
   - Создайте базу данных

5. **Добавьте переменные окружения**

6. **Деплой** → Получите URL

## 📋 Шаг 4: Настройка переменных окружения

### Frontend (Vercel)

В настройках проекта на Vercel → Settings → Environment Variables:

```
VITE_API_URL = https://your-backend-domain.com
VITE_APP_NAME = Nisab
VITE_TELEGRAM_BOT_NAME = your_bot_name
```

### Backend (Railway/Render/DigitalOcean)

Все переменные из `backend/.env.example`:

```
NODE_ENV = production
PORT = 3000 (или автоматически)
DATABASE_URL = (автоматически от PostgreSQL)
TELEGRAM_BOT_TOKEN = your_bot_token
TELEGRAM_WEBAPP_SECRET = your_webapp_secret
YOOKASSA_SHOP_ID = your_shop_id
YOOKASSA_SECRET_KEY = your_secret_key
CLOUDPAYMENTS_PUBLIC_ID = your_public_id
CLOUDPAYMENTS_SECRET_KEY = your_secret_key
ELASTICSEARCH_URL = http://localhost:9200 (или ваш ES URL)
API_TOKEN = test_token_123
JWT_SECRET = your_jwt_secret_change_this
ADMIN_API_KEY = your_admin_key
CORS_ORIGIN = https://your-frontend.vercel.app
FRONTEND_URL = https://your-frontend.vercel.app
```

## 📋 Шаг 5: Настройка Telegram Bot Webhook

После развертывания backend:

```bash
# Замените YOUR_BOT_TOKEN и YOUR_BACKEND_URL
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_BACKEND_URL/api/v1/telegram/webhook"}'
```

Проверка webhook:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

## 📋 Шаг 6: Настройка платежных webhooks

### YooKassa

1. Личный кабинет → Настройки магазина
2. Webhooks → Добавить URL
3. URL: `https://YOUR_BACKEND_URL/api/v1/payments/webhook/yookassa`

### CloudPayments

1. Личный кабинет → Настройки
2. Webhooks → Добавить URL
3. URL: `https://YOUR_BACKEND_URL/api/v1/payments/webhook/cloudpayments`

## 📋 Шаг 7: Настройка Telegram Mini App

1. Откройте @BotFather в Telegram
2. Выберите своего бота
3. Отправьте команду `/newapp`
4. Выберите бота
5. Укажите данные:
   - **Title:** Nisab - Садака Пасс
   - **Short name:** nisab (без пробелов и спецсимволов)
   - **Description:** Telegram Mini App для пожертвований
   - **Photo:** Загрузите иконку (опционально)
   - **Web App URL:** `https://your-frontend.vercel.app`
   - **GIF:** Опционально

6. Сохраните секрет и добавьте в backend переменные:
   ```
   TELEGRAM_WEBAPP_SECRET = полученный_секрет
   ```

## 📋 Шаг 8: Миграции базы данных

На сервере backend выполните миграции:

### Railway

```bash
# Установите Railway CLI
npm i -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Запустите миграции
railway run npm run migrate

# Опционально: seed данных
railway run npm run seed
```

### Render

Через Shell в Dashboard:
```bash
cd backend
npm run migrate
npm run seed
```

### DigitalOcean

Через App Platform Console или SSH.

## 📋 Шаг 9: Проверка работы

### 9.1. Frontend

1. Откройте URL вашего Vercel проекта
2. Проверьте, что страницы загружаются
3. Проверьте консоль браузера на ошибки

### 9.2. Backend

```bash
# Health check
curl https://YOUR_BACKEND_URL/health

# Должен вернуть:
# {"status":"ok","timestamp":"..."}
```

### 9.3. Telegram Bot

1. Найдите бота в Telegram
2. Отправьте `/start`
3. Бот должен ответить с кнопками

### 9.4. Mini App

1. Откройте бота
2. Нажмите на кнопку Mini App или отправьте `/sadaqa`
3. Mini App должна открыться

## 📋 Шаг 10: Настройка кастомного домена (опционально)

### Frontend (Vercel)

1. Settings → Domains
2. Add Domain
3. Введите ваш домен
4. Следуйте инструкциям для DNS настройки

### Backend

Настройте домен через панель вашего провайдера (Railway/Render/DigitalOcean).

## 🔧 Полезные команды

### Git

```bash
# Добавить изменения
git add .

# Коммит
git commit -m "Deploy to production"

# Push в GitHub
git push origin main

# Vercel автоматически пересоберет при push
```

### Railway CLI

```bash
# Просмотр логов
railway logs

# Открыть shell
railway shell

# Переменные окружения
railway variables
```

### Vercel CLI

```bash
# Просмотр логов
vercel logs

# Просмотр проектов
vercel ls

# Обновить переменные окружения
vercel env add VITE_API_URL
```

## ⚠️ Важные замечания

1. **CORS настройки:** Убедитесь, что `CORS_ORIGIN` в backend содержит URL вашего Vercel проекта

2. **Переменные окружения:** Все переменные должны быть установлены на обоих сервисах

3. **HTTPS обязателен:** Webhooks от Telegram и платежных систем требуют HTTPS

4. **База данных:** Используйте managed PostgreSQL от вашего провайдера

5. **Elasticsearch:** Опционален, но лучше использовать managed Elasticsearch (например, Elastic Cloud)

## 🆘 Решение проблем

### Проблема: Frontend не может подключиться к Backend

**Решение:**
1. Проверьте `VITE_API_URL` в Vercel
2. Проверьте CORS настройки в backend
3. Проверьте, что backend доступен

### Проблема: Webhooks не работают

**Решение:**
1. Убедитесь, что backend доступен извне (HTTPS)
2. Проверьте URL webhooks в личных кабинетах
3. Проверьте логи backend для ошибок

### Проблема: Telegram Bot не отвечает

**Решение:**
1. Проверьте webhook URL
2. Проверьте `TELEGRAM_BOT_TOKEN`
3. Проверьте логи backend

## ✅ Готово!

После выполнения всех шагов проект будет полностью развернут и готов к использованию!

