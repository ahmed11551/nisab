# Архитектура проекта Nisab

## Обзор

Nisab - это Telegram Mini App для пожертвований (садака), подписок (садака-джария), калькулятора закята и целевых кампаний.

## Компоненты

### Frontend (Telegram Mini App)

**Технологии:**
- React 18
- TypeScript
- Vite
- React Router
- Zustand (state management)
- React Query (data fetching)
- i18next (интернационализация)

**Структура:**
```
frontend/
├── src/
│   ├── components/    # Переиспользуемые компоненты
│   ├── pages/        # Страницы приложения
│   ├── services/     # API клиенты
│   ├── hooks/         # Custom hooks
│   ├── store/         # Zustand stores
│   ├── utils/         # Утилиты
│   └── i18n/          # Локализация
```

### Backend (REST API)

**Технологии:**
- Node.js
- Express
- TypeScript
- Sequelize (ORM)
- PostgreSQL
- Winston (логирование)

**Структура:**
```
backend/
├── src/
│   ├── routes/        # API маршруты
│   ├── controllers/   # Контроллеры
│   ├── services/     # Бизнес-логика
│   ├── database/      # Модели БД и миграции
│   ├── middleware/    # Middleware
│   ├── integrations/  # Интеграции с внешними сервисами
│   └── utils/         # Утилиты
```

## База данных

### Сущности

1. **User** - Пользователи Telegram
2. **Fund** - Фонды-партнёры
3. **Donation** - Пожертвования
4. **Subscription** - Подписки
5. **DerivedAlms** - Отчисления от подписок
6. **ZakatCalc** - Расчёты закята
7. **Campaign** - Целевые кампании
8. **PartnerApplication** - Заявки на партнёрство

### Связи

- Donation → User, Fund, Campaign
- Subscription → User
- DerivedAlms → Subscription, User, Fund
- ZakatCalc → User
- Campaign → User (owner), Fund
- PartnerApplication → User

## Интеграции

### Платежные системы

1. **YooKassa** - для карт РФ
2. **CloudPayments** - для международных карт

Логика выбора провайдера:
- Определение BIN карты (первые 6-8 цифр)
- Если BIN ∈ РФ → YooKassa
- Иначе → CloudPayments

### Elasticsearch

Используется для поиска фондов через API bot.e-replika.ru.

Индекс: `funds`

### Telegram

- **Mini App** - основной интерфейс
- **Bot** - команды и inline-кнопки

## Безопасность

1. Валидация Telegram WebApp initData
2. JWT токены для аутентификации
3. Подписи webhooks от платежных провайдеров
4. Rate limiting
5. CORS настройки
6. Хранение только токенов провайдеров (не PAN/expiry/CVV)

## Развёртывание

### Docker Compose

Все сервисы контейнеризованы:
- PostgreSQL
- Redis (опционально)
- Elasticsearch
- Backend API
- Frontend (Nginx)

### Production

- Backend: Node.js + PM2 или systemd
- Frontend: Nginx
- Database: PostgreSQL с резервным копированием
- Monitoring: Winston логов + Prometheus (опционально)

## Монетизация

1. **Подписки** - Базовый/Pro/Premium
2. **Отчисления** - 5% от Pro, 10% от Premium в благотворительность
3. **Комиссия** - 2-5% на покрытие эквайринга/сервера (согласовано с фондами)

