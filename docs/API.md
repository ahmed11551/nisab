# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Все эндпоинты требуют валидации Telegram WebApp initData.

Заголовок запроса:
```
X-Telegram-Init-Data: <telegram_webapp_init_data>
```

## Endpoints

### Donations

#### POST `/donations/init`

Создать пожертвование.

**Request Body:**
```json
{
  "fund_id": "uuid",
  "purpose": "orphans",
  "amount": {
    "value": 1000,
    "currency": "RUB"
  },
  "payment_channel": "auto"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donation_id": "uuid",
    "provider": "yookassa",
    "payment_url": "https://...",
    "expires_at": "2025-10-25T21:15:00Z"
  }
}
```

#### GET `/donations/:id/status`

Получить статус пожертвования.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "paid",
    "amount": 1000,
    "currency": "RUB"
  }
}
```

### Subscriptions

#### POST `/subscriptions/init`

Создать подписку.

**Request Body:**
```json
{
  "plan_id": "premium",
  "period": "P12M"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "uuid",
    "provider": "yookassa",
    "confirmation_url": "https://..."
  }
}
```

#### PATCH `/subscriptions/:id`

Обновить подписку.

**Request Body:**
```json
{
  "action": "pause"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "paused"
  }
}
```

#### GET `/subscriptions`

Получить список подписок пользователя.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan": "premium",
      "period": "P12M",
      "status": "active",
      "next_charge_at": "2025-11-01T00:00:00Z"
    }
  ]
}
```

### Zakat

#### POST `/zakat/calc`

Рассчитать закят.

**Request Body:**
```json
{
  "assets": {
    "cash_total": 250000,
    "gold_g": 50,
    "silver_g": 0,
    "business_goods_value": 180000,
    "investments": 120000,
    "receivables_collectible": 20000
  },
  "debts_short_term": 60000,
  "nisab_currency": "RUB",
  "nisab_value": 64000,
  "rate_percent": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "zakat_due": 12750,
    "above_nisab": true,
    "calculation_id": "uuid"
  }
}
```

#### POST `/zakat/pay`

Выплатить закят.

**Request Body:**
```json
{
  "calculation_id": "uuid",
  "amount": {
    "value": 12750,
    "currency": "RUB"
  }
}
```

### Funds

#### GET `/funds`

Получить список фондов.

**Query Parameters:**
- `country` - код страны (опционально)
- `purpose` - цель пожертвования (опционально)
- `query` - поисковый запрос (опционально)
- `from` - смещение (по умолчанию 0)
- `size` - размер страницы (по умолчанию 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Фонд помощи сиротам",
        "country_code": "RU",
        "purposes": ["orphans"],
        "verified": true,
        "logo_url": "https://...",
        "short_desc": "Описание фонда"
      }
    ],
    "total": 10
  }
}
```

#### GET `/funds/:id`

Получить информацию о фонде.

### Partners

#### GET `/partners/countries`

Получить список стран с партнёрскими фондами.

**Response:**
```json
{
  "success": true,
  "data": [
    { "code": "RU", "name": "Россия" },
    { "code": "KZ", "name": "Казахстан" }
  ]
}
```

#### GET `/partners/funds`

Получить список партнёрских фондов.

**Query Parameters:**
- `country` - код страны
- `categories` - категории (через запятую)
- `search` - поисковый запрос
- `from` - смещение
- `size` - размер страницы

#### POST `/partners/applications`

Отправить заявку на партнёрство.

**Request Body:**
```json
{
  "org_name": "Charity Foundation",
  "country_code": "RU",
  "categories": ["orphans", "foundation_needs"],
  "website": "https://example.org",
  "contact_name": "Иван",
  "email": "contact@example.org",
  "phone": "+7...",
  "about": "Кратко о фонде",
  "consents": {
    "privacy": true,
    "terms": true
  }
}
```

### Campaigns

#### GET `/campaigns`

Получить список кампаний.

**Query Parameters:**
- `status` - статус (active, completed, etc.)
- `country` - код страны
- `category` - категория
- `from` - смещение
- `size` - размер страницы

#### GET `/campaigns/:id`

Получить информацию о кампании.

#### POST `/campaigns`

Создать кампанию.

**Request Body:**
```json
{
  "title": "Сбор на ремонт мечети",
  "description": "Описание кампании",
  "category": "mosque",
  "goal_amount": 100000,
  "country_code": "RU",
  "fund_id": "uuid",
  "end_date": "2025-12-31",
  "image_url": "https://..."
}
```

#### POST `/campaigns/:id/donate`

Пожертвовать в кампанию.

**Request Body:**
```json
{
  "amount": {
    "value": 5000,
    "currency": "RUB"
  }
}
```

### Me

#### GET `/me/history`

Получить историю пожертвований/подписок/закята.

**Query Parameters:**
- `type` - тип (donation, subscription, zakat)
- `period` - период (2025-01..2025-12)
- `from` - смещение
- `size` - размер страницы

#### GET `/me/subscriptions`

Получить подписки пользователя.

#### GET `/me/receipts/:id.pdf`

Получить чек в формате PDF.

## Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400
  }
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

