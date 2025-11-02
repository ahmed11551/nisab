# 🚀 Полная инструкция по деплою на Vercel через GitHub

## 📋 Содержание

1. [Подготовка к деплою](#1-подготовка-к-деплою)
2. [Настройка GitHub](#2-настройка-github)
3. [Настройка Vercel](#3-настройка-vercel)
4. [Настройка переменных окружения](#4-настройка-переменных-окружения)
5. [Настройка Telegram бота для Vercel](#5-настройка-telegram-бота-для-vercel)
6. [Настройка webhook](#6-настройка-webhook)
7. [Проверка работы](#7-проверка-работы)
8. [Решение проблем](#8-решение-проблем)

---

## 1. Подготовка к деплою

### Шаг 1.1: Проверить структуру проекта

Убедитесь, что у вас есть:
- ✅ `backend/` — backend приложение
- ✅ `frontend/` — frontend приложение
- ✅ `vercel.json` — конфигурация Vercel (опционально)

### Шаг 1.2: Подготовить файлы для деплоя

Создайте файл `vercel.json` в корне проекта (если еще нет):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

⚠️ **Примечание:** Для полного деплоя backend на Vercel может потребоваться дополнительная настройка. Рассмотрите использование отдельного сервиса для backend (например, Railway, Render, или отдельный VPS).

---

## 2. Настройка GitHub

### Шаг 2.1: Создать репозиторий на GitHub

1. Откройте [GitHub](https://github.com)
2. Нажмите **New repository**
3. Название: `nisab` (или любое другое)
4. Описание: `Nisab - Платформа для садака и закята`
5. Выберите **Public** или **Private**
6. **НЕ** добавляйте README, .gitignore, license (если они уже есть)
7. Нажмите **Create repository**

### Шаг 2.2: Инициализировать git (если еще не инициализирован)

```bash
cd C:\Users\Dev-Ops\Desktop\nisab

# Проверить статус git
git status

# Если не инициализирован, инициализировать
git init

# Добавить все файлы
git add .

# Сделать первый коммит
git commit -m "Initial commit: Nisab platform"
```

### Шаг 2.3: Добавить remote и запушить

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/nisab.git

# Переименовать ветку в main (если нужно)
git branch -M main

# Запушить код
git push -u origin main
```

### Шаг 2.4: Убедиться, что .env не закоммичен

Проверьте `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test
backend/.env
frontend/.env
```

---

## 3. Настройка Vercel

### Шаг 3.1: Создать аккаунт на Vercel

1. Откройте [Vercel](https://vercel.com)
2. Нажмите **Sign Up**
3. Выберите **Continue with GitHub**
4. Авторизуйтесь через GitHub

### Шаг 3.2: Импортировать проект

1. В Vercel нажмите **Add New...** → **Project**
2. Выберите ваш репозиторий `nisab`
3. Нажмите **Import**

### Шаг 3.3: Настроить проект

**Root Directory:** Оставьте пустым (если проект в корне) или укажите `frontend` для frontend-only

**Framework Preset:** 
- Для frontend: `Vite` или `Other`
- Для backend: `Other`

**Build Command:**
- Для frontend: `cd frontend && npm run build`
- Для backend: `cd backend && npm run build` (если есть)

**Output Directory:**
- Для frontend: `frontend/dist`
- Для backend: `backend/dist` (если есть)

**Install Command:** `npm install`

---

## 4. Настройка переменных окружения

### Шаг 4.1: Открыть настройки проекта

1. В Vercel выберите ваш проект
2. Перейдите в **Settings** → **Environment Variables**

### Шаг 4.2: Добавить переменные для Frontend

Добавьте следующие переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-domain.com` | Production, Preview, Development |
| `VITE_APP_NAME` | `Nisab` | Production, Preview, Development |
| `VITE_TELEGRAM_BOT_NAME` | `Nisab_sad_bot` | Production, Preview, Development |

⚠️ **Важно:** Замените `your-backend-domain.com` на реальный домен вашего backend

### Шаг 4.3: Добавить переменные для Backend (если деплоите backend)

Если вы деплоите backend на Vercel (или другой сервис), добавьте:

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `PORT` | `3000` | Production |
| `DATABASE_URL` | `your_database_url` | Production |
| `TELEGRAM_BOT_TOKEN` | `8417046320:AAF6TExdeJiSq3xK0Cy2GhL8KVRrvZf7UWQ` | Production |
| `TELEGRAM_WEBAPP_SECRET` | `your_webapp_secret` | Production |
| `CORS_ORIGIN` | `https://your-frontend-domain.vercel.app` | Production |
| `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | Production |
| `JWT_SECRET` | `your_secure_jwt_secret` | Production |

---

## 5. Настройка Telegram бота для Vercel

### Шаг 5.1: Получить URL Vercel

После деплоя вы получите URL вида:
```
https://nisab-xxx.vercel.app
```

Или настройте свой домен:
```
https://nisab.com
```

### Шаг 5.2: Обновить Mini App URL в @BotFather

1. Откройте @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите **@Nisab_sad_bot**
4. Выберите "Edit App"
5. Измените URL на ваш Vercel URL:
   ```
   https://your-frontend-domain.vercel.app
   ```
   или
   ```
   https://your-custom-domain.com
   ```

### Шаг 5.3: Обновить переменные окружения

В Vercel обновите:
- `CORS_ORIGIN` = ваш Vercel URL
- `FRONTEND_URL` = ваш Vercel URL

---

## 6. Настройка webhook

### Вариант A: Если backend на Vercel

После деплоя backend на Vercel, получите URL:
```
https://your-backend.vercel.app
```

Установите webhook:

```bash
curl -X POST https://your-backend.vercel.app/api/v1/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend.vercel.app/api/v1/telegram/webhook"}'
```

Или через GET:

```bash
curl "https://your-backend.vercel.app/api/v1/telegram/set-webhook?url=https://your-backend.vercel.app/api/v1/telegram/webhook"
```

### Вариант B: Если backend на другом сервисе

Если backend деплоится на другой сервис (Railway, Render, VPS):

```bash
curl -X POST https://your-backend-domain.com/api/v1/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend-domain.com/api/v1/telegram/webhook"}'
```

### Проверка webhook

```bash
curl https://your-backend-domain.com/api/v1/telegram/webhook-info
```

---

## 7. Проверка работы

### Шаг 7.1: Проверить Frontend

1. Откройте ваш Vercel URL: `https://your-frontend-domain.vercel.app`
2. Должна загрузиться главная страница приложения

### Шаг 7.2: Проверить Backend API

```bash
curl https://your-backend-domain.com/health
```

Должен вернуться:
```json
{"status":"ok","timestamp":"..."}
```

### Шаг 7.3: Проверить Telegram бота

1. Откройте Telegram
2. Найдите **@Nisab_sad_bot**
3. Отправьте `/start`
4. Бот должен ответить с главным меню

### Шаг 7.4: Проверить Mini App

1. В боте нажмите кнопку "🌐 Открыть Mini App"
2. Должно открыться ваше приложение на Vercel

---

## 8. Решение проблем

### Проблема: Frontend не загружается

**Проверки:**
1. ✅ Переменные окружения настроены в Vercel?
2. ✅ Build проходит успешно?
3. ✅ Output Directory правильный?

**Решение:**
- Проверьте логи деплоя в Vercel
- Проверьте переменные окружения
- Убедитесь, что `dist` папка создается после build

### Проблема: Backend API не работает

**Проверки:**
1. ✅ Backend деплоится отдельно?
2. ✅ Переменные окружения настроены?
3. ✅ Database URL правильный?

**Решение:**
- Рассмотрите деплой backend на отдельный сервис (Railway, Render)
- Проверьте логи backend
- Убедитесь, что DATABASE_URL доступен из интернета

### Проблема: Бот не отвечает

**Проверки:**
1. ✅ Webhook настроен?
2. ✅ Backend доступен из интернета?
3. ✅ TELEGRAM_BOT_TOKEN правильный?

**Решение:**
```bash
# Проверить webhook
curl https://your-backend-domain.com/api/v1/telegram/webhook-info

# Переустановить webhook
curl -X POST https://your-backend-domain.com/api/v1/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend-domain.com/api/v1/telegram/webhook"}'
```

### Проблема: Mini App не открывается

**Проверки:**
1. ✅ URL в @BotFather правильный?
2. ✅ CORS настроен правильно?
3. ✅ Frontend доступен по HTTPS?

**Решение:**
- Обновите URL в @BotFather на ваш Vercel URL
- Проверьте CORS_ORIGIN в backend
- Убедитесь, что используется HTTPS

---

## ⚠️ Важные замечания

### Backend на Vercel

⚠️ **Ограничения Vercel для backend:**

1. **Serverless Functions:** Время выполнения ограничено (10 секунд для Hobby плана)
2. **Database Connections:** Может быть проблема с постоянными подключениями к БД
3. **Webhooks:** Могут быть задержки из-за холодного старта

**Рекомендации:**
- Используйте Vercel для Frontend
- Используйте отдельный сервис для Backend (Railway, Render, Fly.io)

### Альтернативы для Backend

1. **Railway** - https://railway.app
   - Легко деплоится из GitHub
   - PostgreSQL в одном клике
   - Бесплатный tier доступен

2. **Render** - https://render.com
   - Бесплатный tier для небольших проектов
   - PostgreSQL доступен

3. **Fly.io** - https://fly.io
   - Хорошо работает с Docker
   - Глобальная сеть

---

## ✅ Чек-лист деплоя

- [ ] Код загружен в GitHub
- [ ] Репозиторий подключен к Vercel
- [ ] Frontend успешно деплоится
- [ ] Переменные окружения настроены
- [ ] Backend деплоится (на Vercel или другом сервисе)
- [ ] Database настроена и доступна
- [ ] Telegram Bot Token настроен
- [ ] WebApp Secret настроен
- [ ] Mini App URL обновлен в @BotFather
- [ ] Webhook настроен и работает
- [ ] Бот отвечает на команды
- [ ] Mini App открывается из бота

---

## 🎉 Готово!

После выполнения всех шагов ваш проект будет полностью задеплоен на Vercel!

---

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Telegram Bot API](https://core.telegram.org/bots/api)

