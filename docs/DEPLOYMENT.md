# Deployment Guide

## Предварительные требования

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (опционально)
- Elasticsearch (опционально, для поиска фондов)

## Локальная разработка

### 1. Установка зависимостей

```bash
# Установка всех зависимостей
npm run install:all
```

### 2. Настройка базы данных

```bash
# Создание базы данных
createdb nisab_db

# Запуск миграций
cd backend
npm run migrate
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` файлы и заполните:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 4. Запуск приложения

```bash
# Запуск frontend и backend
npm run dev

# Или отдельно:
npm run dev:frontend
npm run dev:backend
```

## Docker Deployment

### 1. Использование Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### 2. Сборка образов

```bash
# Backend
cd backend
docker build -t nisab-backend .

# Frontend
cd frontend
docker build -t nisab-frontend .
```

## Production Deployment

### 1. Подготовка сервера

```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Установка Nginx
sudo apt-get install nginx
```

### 2. Настройка базы данных

```bash
# Создание пользователя и базы данных
sudo -u postgres psql
CREATE USER nisab WITH PASSWORD 'secure_password';
CREATE DATABASE nisab_db OWNER nisab;
\q
```

### 3. Настройка переменных окружения

Создайте `.env` файлы с production значениями:

```bash
# Backend .env
NODE_ENV=production
DATABASE_URL=postgresql://nisab:secure_password@localhost:5432/nisab_db
# ... остальные переменные
```

### 4. Развёртывание приложения

```bash
# Клонирование репозитория
git clone <repository-url>
cd nisab

# Установка зависимостей
npm run install:all

# Сборка
npm run build

# Миграции
cd backend
npm run migrate

# Запуск (используйте PM2 или systemd)
pm2 start dist/index.js --name nisab-backend
```

### 5. Настройка Nginx

Создайте конфигурацию для Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6. SSL сертификат (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Мониторинг

### Health Check

```bash
curl http://localhost:3000/health
```

### Логи

```bash
# PM2 логи
pm2 logs nisab-backend

# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Резервное копирование

```bash
# Бэкап базы данных
pg_dump -U nisab nisab_db > backup_$(date +%Y%m%d).sql

# Восстановление
psql -U nisab nisab_db < backup_20250101.sql
```

## Обновление

```bash
# Получение последних изменений
git pull origin main

# Обновление зависимостей
npm run install:all

# Миграции базы данных
cd backend
npm run migrate

# Пересборка
npm run build

# Перезапуск
pm2 restart nisab-backend
```

