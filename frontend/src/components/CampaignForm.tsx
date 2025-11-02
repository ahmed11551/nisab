import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { campaignsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
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
  const { t } = useTranslation()
  const tg = useTelegramWebApp()

  const { register, handleSubmit, formState: { errors } } = useForm<CampaignFormData>({
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
        if (tg?.showAlert) {
          tg.showAlert('Кампания создана! Она будет опубликована после модерации.')
        } else if (typeof window !== 'undefined') {
          window.alert('Кампания создана! Она будет опубликована после модерации.')
        }
        onSuccess?.(response.data.id)
      },
      onError: (error: Error) => {
        onError?.(error)
      },
    }
  )

  const onSubmit = (data: CampaignFormData) => {
    if (!data.goal_amount || data.goal_amount <= 0) {
      return
    }
    mutation.mutate(data)
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
        <label>URL изображения (опционально)</label>
        <input
          type="url"
          {...register('image_url')}
          placeholder="https://example.com/image.jpg"
        />
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
        {mutation.isLoading ? t('common.loading') : 'Создать кампанию'}
      </button>
    </form>
  )
}

export default CampaignForm

