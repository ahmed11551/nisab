# Настройка базы данных

## Вариант A: Docker (рекомендуется)

1. **Убедитесь, что Docker Desktop запущен**

2. **Запустите PostgreSQL контейнер:**
```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nisab_db --name nisab_postgres postgres:14
```

3. **Проверьте, что контейнер запущен:**
```bash
docker ps
```

## Вариант B: Локальная установка PostgreSQL

1. **Установите PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Или через Chocolatey: `choco install postgresql`

2. **Создайте базу данных:**
```bash
createdb -U postgres nisab_db
```

3. **Обновите `backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/nisab_db
```

## После настройки базы данных

Запустите миграции:
```bash
cd backend
npm run migrate
```

