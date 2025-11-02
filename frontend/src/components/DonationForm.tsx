import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { donationsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import './DonationForm.css'

interface DonationFormData {
  fund_id: string
  amount: number
  purpose?: string
}

interface DonationFormProps {
  fundId: string
  onSuccess?: (paymentUrl: string) => void
  onError?: (error: Error) => void
}

const DonationForm = ({ fundId, onSuccess, onError }: DonationFormProps) => {
  const { t } = useTranslation()
  const tg = useTelegramWebApp()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const amountPresets = [100, 250, 500, 1000]

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DonationFormData>({
    defaultValues: {
      fund_id: fundId,
      amount: 0,
    },
  })

  const amount = watch('amount')

  const mutation = useMutation(
    (data: DonationFormData) =>
      donationsApi.init({
        fund_id: data.fund_id,
        purpose: data.purpose,
        amount: { value: data.amount, currency: 'RUB' },
        payment_channel: 'auto',
      }),
    {
      onSuccess: (response) => {
        if (response.data.payment_url && tg) {
          tg.openLink(response.data.payment_url)
          onSuccess?.(response.data.payment_url)
        }
      },
      onError: (error: Error) => {
        onError?.(error)
      },
    }
  )

  const onSubmit = (data: DonationFormData) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="donation-form">
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

      <input type="hidden" {...register('fund_id')} value={fundId} />
      <input type="hidden" {...register('purpose')} />

      <button
        type="submit"
        className="submit-btn"
        disabled={mutation.isLoading || !amount || amount <= 0}
      >
        {mutation.isLoading ? t('common.loading') : `${t('donate.continue')} ${amount || 0} ₽`}
      </button>
    </form>
  )
}

export default DonationForm

