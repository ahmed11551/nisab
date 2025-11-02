# Исправление ошибок подключения к серверу

## Проблема
На всех страницах приложения отображается ошибка "Не удалось подключиться к серверу" и состояние "Загрузка..." застревает.

## Что было исправлено

1. **Улучшена обработка ошибок в API клиенте** (`frontend/src/services/api.ts`):
   - Сообщение об ошибке теперь указывает на то, что нужно проверить, запущен ли сервер на `http://localhost:3000`

2. **Исправлена обработка ошибок во всех мутациях**:
   - Добавлен `retry: false` во все `useMutation` хуки, чтобы предотвратить застревание состояния загрузки
   - Исправлена ошибка в `SupportPage.tsx` где пытались вызвать `mutation.reset()` до определения `mutation`

3. **Улучшены сообщения об ошибках**:
   - Сообщения теперь более информативны и указывают на конкретную проблему

## Что нужно сделать

### 1. Создать файл `.env` в директории `frontend`

Создайте файл `frontend/.env` со следующим содержимым:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Nisab
VITE_TELEGRAM_BOT_NAME=nisab_bot
```

### 2. Убедиться, что backend запущен

Запустите backend сервер:

```bash
cd backend
npm run dev
```

Backend должен быть доступен по адресу `http://localhost:3000`. Проверьте это, открыв в браузере:
- http://localhost:3000/health

Вы должны увидеть:
```json
{"status":"ok","timestamp":"..."}
```

### 3. Перезапустить frontend

Если frontend уже запущен, перезапустите его после создания `.env` файла:

```bash
cd frontend
npm run dev
```

Frontend должен быть доступен по адресу `http://localhost:5173` (или другому порту, указанному в консоли).

## Проверка работы

1. Откройте http://localhost:5173 (или другой порт из консоли)
2. Перейдите на страницу "Пожертвовать" (`/donate`)
3. Ошибка должна исчезнуть, если backend запущен
4. Если backend не запущен, вы увидите более информативное сообщение об ошибке

## Измененные файлы

- `frontend/src/services/api.ts` - улучшены сообщения об ошибках
- `frontend/src/pages/SupportPage.tsx` - исправлена обработка ошибок, добавлен `retry: false`
- `frontend/src/components/DonationForm.tsx` - добавлен `retry: false`
- `frontend/src/components/CampaignDonateForm.tsx` - добавлен `retry: false`
- `frontend/src/components/SubscriptionForm.tsx` - добавлен `retry: false`
- `frontend/src/components/CampaignForm.tsx` - добавлен `retry: false`
- `frontend/src/pages/ZakatPage.tsx` - добавлен `retry: false` в обе мутации
- `frontend/src/pages/PartnerApplicationPage.tsx` - добавлен `retry: false`

## Дополнительные заметки

- Если ошибка все еще появляется, убедитесь, что:
  1. Backend запущен и доступен на порту 3000
  2. В `frontend/.env` указан правильный `VITE_API_URL`
  3. Frontend перезапущен после создания `.env` файла
  4. Нет конфликтов портов (другие приложения не используют порт 3000 или 5173)

