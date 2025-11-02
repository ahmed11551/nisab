import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { campaignsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import ErrorMessage from '../components/ErrorMessage'
import './CampaignDonateForm.css'

interface CampaignDonateFormData {
  amount: number
}

interface CampaignDonateFormProps {
  campaignId: string
  onSuccess?: (paymentUrl: string) => void
  onError?: (error: Error) => void
}

const CampaignDonateForm = ({ campaignId, onSuccess, onError }: CampaignDonateFormProps) => {
  const { t } = useTranslation()
  const tg = useTelegramWebApp()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const amountPresets = [100, 250, 500, 1000, 2500, 5000]

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CampaignDonateFormData>({
    defaultValues: {
      amount: 0,
    },
  })

  const amount = watch('amount')

  const mutation = useMutation(
    (data: CampaignDonateFormData) =>
      campaignsApi.donate(campaignId, {
        amount: { value: data.amount, currency: 'RUB' },
        payment_channel: 'auto',
      }),
    {
      onSuccess: (response) => {
        if (response.data.payment_url) {
          if (tg?.openLink) {
            tg.openLink(response.data.payment_url)
          } else if (typeof window !== 'undefined') {
            window.open(response.data.payment_url, '_blank')
          }
          onSuccess?.(response.data.payment_url)
        }
      },
      onError: (error: Error) => {
        onError?.(error)
      },
      retry: false, // Don't retry automatically to prevent stuck loading state
    }
  )

  const onSubmit = (data: CampaignDonateFormData) => {
    if (!data.amount || data.amount <= 0) {
      return
    }
    mutation.mutate(data)
  }

  const handleAmountPreset = (preset: number) => {
    setValue('amount', preset)
    setSelectedAmount(preset)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="campaign-donate-form">
      <div className="amount-presets">
        <label>{t('donate.presets')}</label>
        <div className="preset-buttons">
          {amountPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`preset-btn ${selectedAmount === preset ? 'active' : ''}`}
              onClick={() => handleAmountPreset(preset)}
            >
              {preset} ₽
            </button>
          ))}
        </div>
      </div>

      <div className="custom-amount">
        <label>{t('donate.customAmount')}</label>
        <input
          type="number"
          {...register('amount', {
            required: t('common.error') + ': ' + t('donate.amount') + ' обязательна',
            min: { value: 1, message: 'Минимальная сумма 1 ₽' },
          })}
          placeholder="0"
          min="1"
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            if (!isNaN(val)) {
              setSelectedAmount(null)
            }
          }}
        />
        {errors.amount && <span className="error">{errors.amount.message}</span>}
      </div>

      {mutation.error && (
        <ErrorMessage
          title="Ошибка при пожертвовании"
          message={
            mutation.error instanceof Error
              ? mutation.error.message
              : 'Не удалось инициализировать пожертвование. Попробуйте позже.'
          }
          onRetry={() => mutation.reset()}
        />
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={mutation.isLoading || !amount || amount <= 0}
      >
        {mutation.isLoading ? t('common.loading') : `Присоединиться ${amount || 0} ₽`}
      </button>
    </form>
  )
}

export default CampaignDonateForm

