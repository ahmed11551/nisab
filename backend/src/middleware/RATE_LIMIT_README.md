# Rate Limiting Middleware

## Что такое Rate Limiting?

**Rate Limiting (ограничение частоты запросов)** — это механизм защиты API от злоупотреблений и перегрузок, который ограничивает количество запросов от одного пользователя или IP-адреса в единицу времени.

## Зачем нужен Rate Limiting?

### 1. **Защита от злоупотреблений и DDoS-атак**
   - Предотвращает отправку большого количества запросов от одного пользователя
   - Защищает сервер от перегрузки
   - Сохраняет ресурсы для легитимных пользователей

### 2. **Защита от ботов и автоматических атак**
   - Ограничивает автоматические скрипты и ботов
   - Защищает от спама и злонамеренных действий
   - Снижает нагрузку на базу данных

### 3. **Справедливое использование ресурсов**
   - Обеспечивает равномерное распределение ресурсов между пользователями
   - Предотвращает монополизацию API одним пользователем
   - Улучшает общую производительность системы

### 4. **Соблюдение лимитов провайдеров**
   - Помогает не превышать лимиты внешних API (платежные системы, Telegram API и т.д.)
   - Снижает расходы на внешние сервисы

## Реализация в проекте

### Текущие лимиты (согласно ТЗ):

1. **Общий API лимит**: 50 запросов в минуту на пользователя
2. **Пожертвования**: 20 запросов в минуту
3. **Подписки**: 5 запросов в минуту
4. **Создание кампаний**: 10 запросов в час
5. **Аутентификация**: 5 запросов в минуту (готово к использованию)

### Как работает:

1. **Определение пользователя**:
   - Приоритет: User ID (из Telegram) > IP адрес
   - Если пользователь авторизован, используется его ID
   - Иначе используется IP адрес

2. **Хранение данных**:
   - In-memory хранилище (Map) для скорости
   - Автоматическая очистка истёкших записей каждую минуту
   - Для production с несколькими серверами рекомендуется Redis

3. **HTTP заголовки**:
   ```
   X-RateLimit-Limit: 50           # Лимит запросов
   X-RateLimit-Remaining: 45       # Осталось запросов
   X-RateLimit-Reset: 2025-01-02T12:00:00Z  # Время сброса
   Retry-After: 60                 # Секунд до сброса
   ```

4. **Ответ при превышении лимита**:
   ```json
   {
     "success": false,
     "error": {
       "message": "Слишком много запросов. Пожалуйста, попробуйте позже.",
       "code": "RATE_LIMIT_EXCEEDED",
       "retryAfter": 60
     }
   }
   ```
   HTTP Status: **429 Too Many Requests**

## Использование

### 1. Общий лимит для всех API:

```typescript
// В index.ts
app.use('/api/v1', rateLimiters.api, routes)
```

### 2. Специальные лимиты для конкретных маршрутов:

```typescript
import { rateLimiters } from '../middleware/rateLimit'

// Лимит для пожертвований
donationsRoutes.post('/init', rateLimiters.donation, controller.init)

// Лимит для подписок
subscriptionsRoutes.post('/init', rateLimiters.subscription, controller.init)

// Лимит для создания кампаний
campaignsRoutes.post('/', rateLimiters.campaignCreate, controller.create)
```

### 3. Кастомный лимит:

```typescript
import { rateLimit } from '../middleware/rateLimit'

const customLimiter = rateLimit({
  max: 100,
  windowMs: 60000, // 1 минута
  message: 'Кастомное сообщение об ошибке',
})

router.post('/custom', customLimiter, controller.handler)
```

## Логирование

Rate limiting логирует:
- **Предупреждения** при достижении 80% лимита
- **Ошибки** при превышении лимита
- Все события записываются в лог через `logger`

## Миграция на Redis

Для production с несколькими инстансами сервера рекомендуется использовать Redis:

```typescript
import Redis from 'ioredis'

const redis = new Redis(config.redis.url)

// Заменить RateLimitStore на Redis-based реализацию
class RedisRateLimitStore {
  async increment(key: string, windowMs: number) {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.pexpire(key, windowMs)
    }
    const ttl = await redis.pttl(key)
    return { count, resetTime: Date.now() + ttl }
  }
}
```

## Тестирование

Для тестирования rate limiting:

```typescript
import { rateLimitStore } from '../middleware/rateLimit'

// Очистить хранилище перед тестом
beforeEach(() => {
  rateLimitStore.clear()
})
```

## Мониторинг

Rate limiting добавляет информацию в объект запроса:

```typescript
(req as any).rateLimit = {
  limit: 50,
  remaining: 45,
  reset: 1735819200000,
  count: 5,
}
```

Эту информацию можно использовать для мониторинга и аналитики.

