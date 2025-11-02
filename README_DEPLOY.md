# 🚀 Развертывание проекта Nisab

## Быстрая инструкция

### 1. Загрузка в GitHub

```bash
# Инициализация Git (если еще не сделано)
git init

# Добавление файлов
git add .

# Первый коммит
git commit -m "Initial commit: Nisab Sadaqa Pass"

# Создайте репозиторий на GitHub, затем:
git remote add origin https://github.com/YOUR_USERNAME/nisab-sadaqa.git
git branch -M main
git push -u origin main
```

**📖 Подробная инструкция:** [GIT_INSTRUCTIONS.md](./GIT_INSTRUCTIONS.md)

### 2. Развертывание на Vercel

#### Frontend

1. Откройте https://vercel.com
2. Import Project → Выберите GitHub репозиторий
3. Настройте:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: **npm run build**
   - Output Directory: **dist**
4. Добавьте переменные окружения:
   ```
   VITE_API_URL = https://your-backend-url.com
   VITE_APP_NAME = Nisab
   ```
5. Deploy

#### Backend

Рекомендуется использовать отдельный сервис:
- **Railway** (рекомендуется): https://railway.app
- **Render**: https://render.com
- **DigitalOcean**: https://www.digitalocean.com

**📖 Подробная инструкция:** [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

### 3. Настройка после развертывания

1. **Обновите `VITE_API_URL`** в Vercel на реальный backend URL
2. **Настройте Telegram Bot webhook**
3. **Настройте платежные webhooks**
4. **Запустите миграции базы данных**

**📋 Чеклист:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 📚 Полезные ссылки

- [GIT_INSTRUCTIONS.md](./GIT_INSTRUCTIONS.md) - Инструкция по загрузке в GitHub
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) - Детальная инструкция по развертыванию на Vercel
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Чеклист развертывания
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Полная инструкция по GitHub и Vercel

## ✅ Готово!

После выполнения этих шагов проект будет развернут и готов к использованию!

