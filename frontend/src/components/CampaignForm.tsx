import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useState } from 'react'
import { campaignsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import { useToast } from '../context/ToastContext'
import ErrorMessage from '../components/ErrorMessage'
import './CampaignForm.css'

interface CampaignFormData {
  title: string
  description: string
  category: string
  goal_amount: number
  country_code?: string
  fund_id?: string
  end_date?: string
  image_url?: string
}

interface CampaignFormProps {
  onSuccess?: (campaignId: string) => void
  onError?: (error: Error) => void
}

const categories = [
  { value: 'mosque', label: 'Мечеть' },
  { value: 'orphans', label: 'Сироты' },
  { value: 'education', label: 'Обучение' },
  { value: 'intl', label: 'Международная помощь' },
  { value: 'foundation_needs', label: 'Потребности фонда' },
]

const CampaignForm = ({ onSuccess, onError }: CampaignFormProps) => {
  const tg = useTelegramWebApp()
  const toast = useToast()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CampaignFormData>({
    defaultValues: {
      category: '',
      goal_amount: 0,
    },
  })

  const mutation = useMutation(
    (data: CampaignFormData) =>
      campaignsApi.create({
        title: data.title,
        description: data.description,
        category: data.category,
        goal_amount: data.goal_amount,
        country_code: data.country_code,
        fund_id: data.fund_id,
        end_date: data.end_date,
        image_url: data.image_url,
      }),
    {
      onSuccess: (response) => {
        toast.success('Кампания создана! Она будет опубликована после модерации.', 5000)
        onSuccess?.(response.data?.id || response.data?.data?.id)
      },
      onError: (error: Error) => {
        console.error('Campaign creation error:', error)
        const errorMessage = error.message || 'Не удалось создать кампанию. Проверьте введенные данные.'
        toast.error(errorMessage)
        onError?.(error)
      },
      retry: false, // Don't retry automatically to prevent stuck loading state
    }
  )

  const onSubmit = (data: CampaignFormData) => {
    if (!data.goal_amount || data.goal_amount <= 0) {
      toast.warning('Укажите сумму цели больше 0')
      return
    }
    
    // Нормализация URL изображения - добавляем https:// если отсутствует протокол
    const normalizedData = {
      ...data,
      image_url: data.image_url 
        ? (data.image_url.startsWith('http://') || data.image_url.startsWith('https://') 
          ? data.image_url 
          : `https://${data.image_url}`)
        : undefined
    }
    
    mutation.mutate(normalizedData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="campaign-form">
      <div className="form-section">
        <label className="required">Название цели *</label>
        <input
          type="text"
          {...register('title', {
            required: 'Название обязательно',
            minLength: { value: 5, message: 'Минимум 5 символов' },
            maxLength: { value: 100, message: 'Максимум 100 символов' },
          })}
          placeholder="Например: Ремонт мечети в Казани"
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>

      <div className="form-section">
        <label className="required">Описание *</label>
        <textarea
          {...register('description', {
            required: 'Описание обязательно',
            minLength: { value: 20, message: 'Минимум 20 символов' },
            maxLength: { value: 2000, message: 'Максимум 2000 символов' },
          })}
          rows={6}
          placeholder="Подробно опишите цель кампании..."
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <div className="form-section">
        <label className="required">Категория *</label>
        <select
          {...register('category', {
            required: 'Выберите категорию',
          })}
        >
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && <span className="error">{errors.category.message}</span>}
      </div>

      <div className="form-section">
        <label className="required">Сумма цели (₽) *</label>
        <input
          type="number"
          {...register('goal_amount', {
            required: 'Сумма обязательна',
            min: { value: 100, message: 'Минимальная сумма 100 ₽' },
            max: { value: 10000000, message: 'Максимальная сумма 10 000 000 ₽' },
            valueAsNumber: true,
          })}
          placeholder="10000"
          min="100"
        />
        {errors.goal_amount && <span className="error">{errors.goal_amount.message}</span>}
      </div>

      <div className="form-section">
        <label>Страна</label>
        <input
          type="text"
          {...register('country_code')}
          placeholder="RU"
          maxLength={2}
        />
      </div>

      <div className="form-section">
        <label>Дата окончания сбора</label>
        <input
          type="date"
          {...register('end_date')}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-section">
        <label>Изображение (опционально)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Загрузка файла */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  setValue('image_url', '')
                  // Предпросмотр
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                }
              }}
              style={{ 
                width: '100%',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid rgba(74, 158, 255, 0.15)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>
          
          {/* Или URL */}
          <div style={{ textAlign: 'center', color: 'var(--text-hint)', fontSize: '13px' }}>
            или
          </div>
          
          <input
            type="text"
            {...register('image_url', {
              validate: (value: string | undefined) => {
                if (!value && !imageFile) return true // Опциональное поле
                if (imageFile) return true // Если загружен файл, URL не нужен
                if (!value) return true
                // Принимаем любые URL, включая без протокола
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
                if (urlPattern.test(value) || value.startsWith('www.') || value.includes('.')) {
                  return true
                }
                return 'Введите корректный URL изображения'
              },
              onChange: () => {
                // Очищаем предпросмотр при изменении URL
                if (imageFile) {
                  setImageFile(null)
                  setImagePreview(null)
                }
              }
            })}
            placeholder="https://example.com/image.jpg или www.ya.ru/image.jpg"
            style={{ width: '100%' }}
          />
          
          {/* Предпросмотр изображения */}
          {imagePreview && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={imagePreview} 
                alt="Предпросмотр" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(74, 158, 255, 0.2)'
                }} 
              />
              <small style={{ color: 'var(--text-hint)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                ⚠️ Файл выбран, но для сохранения нужно загрузить его на сервер. Пока используйте URL изображения.
              </small>
            </div>
          )}
          
          <small style={{ color: 'var(--text-hint)', fontSize: '12px', display: 'block' }}>
            Можно загрузить файл или указать URL изображения (например: www.ya.ru или https://example.com/image.jpg)
          </small>
        </div>
        {errors.image_url && <span className="error">{errors.image_url.message}</span>}
      </div>

      <div className="form-disclaimer">
        <p>
          После создания кампания будет отправлена на модерацию.
          После одобрения она появится в каталоге.
        </p>
        <p>
          Вы можете начать сбор средств сразу после создания,
          но публично кампания будет доступна после модерации.
        </p>
      </div>

      {mutation.error && (
        <ErrorMessage
          title="Ошибка при создании кампании"
          message={
            mutation.error instanceof Error
              ? mutation.error.message
              : 'Не удалось создать кампанию. Проверьте введенные данные и попробуйте снова.'
          }
          onRetry={() => mutation.reset()}
        />
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? 'Создание...' : 'Создать кампанию'}
      </button>
    </form>
  )
}

export default CampaignForm

