import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { subscriptionsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import { useToast } from '../context/ToastContext'
import ErrorMessage from '../components/ErrorMessage'
import PaymentForm from './PaymentForm'
import './SubscriptionForm.css'

interface SubscriptionFormData {
  plan_id: 'basic' | 'pro' | 'premium'
  period: 'P1M' | 'P3M' | 'P6M' | 'P12M'
}

interface SubscriptionFormProps {
  onSuccess?: (paymentUrl: string) => void
  onError?: (error: Error) => void
}

const SubscriptionForm = ({ onSuccess, onError }: SubscriptionFormProps) => {
  const { t } = useTranslation()
  const tg = useTelegramWebApp()
  const toast = useToast()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<{ plan_id?: string; period?: string; amount?: number } | null>(null)

  const { register, handleSubmit, watch } = useForm<SubscriptionFormData>({
    defaultValues: {
      plan_id: 'basic',
      period: 'P1M',
    },
  })

  const selectedPlan = watch('plan_id')
  const selectedPeriod = watch('period')

  // Тарифы
  const prices: Record<string, Record<string, number>> = {
    basic: { P1M: 290, P3M: 870, P6M: 1160, P12M: 2610 },
    pro: { P1M: 590, P3M: 1770, P6M: 2360, P12M: 5310 },
    premium: { P1M: 990, P3M: 2970, P6M: 3960, P12M: 8910 },
  }

  const currentPrice = prices[selectedPlan]?.[selectedPeriod] || 0

  const mutation = useMutation(
    (data: SubscriptionFormData) =>
      subscriptionsApi.init({
        plan_id: data.plan_id,
        period: data.period,
      }),
    {
      onSuccess: (response) => {
        if (response.data?.confirmation_url || response.data?.data?.confirmation_url) {
          const url = response.data?.confirmation_url || response.data?.data?.confirmation_url
          if (tg?.openLink) {
            tg.openLink(url)
          } else if (typeof window !== 'undefined') {
            window.open(url, '_blank')
          }
          onSuccess?.(url)
        } else {
          // В демо-режиме показываем форму оплаты
          setShowPaymentForm(true)
          setSubscriptionData({ plan_id: data.plan_id, period: data.period, amount: currentPrice })
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Не удалось создать подписку')
        onError?.(error)
      },
      retry: false, // Don't retry automatically to prevent stuck loading state
    }
  )

  const onSubmit = (data: SubscriptionFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="subscription-form">
      <div className="plan-selection">
        <label>{t('subscription.selectPlan')}</label>
        <div className="plans">
          <label className="plan-option">
            <input
              type="radio"
              {...register('plan_id')}
              value="basic"
            />
            <span>{t('subscription.basic')}</span>
          </label>
          <label className="plan-option">
            <input
              type="radio"
              {...register('plan_id')}
              value="pro"
            />
            <span>{t('subscription.pro')}</span>
          </label>
          <label className="plan-option">
            <input
              type="radio"
              {...register('plan_id')}
              value="premium"
            />
            <span>{t('subscription.premium')}</span>
          </label>
        </div>
      </div>

      <div className="period-selection">
        <label>{t('subscription.selectPeriod')}</label>
        <div className="periods">
          <label className="period-option">
            <input type="radio" {...register('period')} value="P1M" />
            <span>1 {t('subscription.perMonth')}</span>
          </label>
          <label className="period-option">
            <input type="radio" {...register('period')} value="P3M" />
            <span>3 {t('subscription.perMonth')}</span>
          </label>
          <label className="period-option">
            <input type="radio" {...register('period')} value="P6M" />
            <span>6 {t('subscription.perMonth')} (+2 в подарок)</span>
          </label>
          <label className="period-option">
            <input type="radio" {...register('period')} value="P12M" />
            <span>12 {t('subscription.perMonth')} (+3 в подарок)</span>
          </label>
        </div>
      </div>

      <div className="price-summary">
        <span className="price-label">Сумма:</span>
        <span className="price-value">{currentPrice} ₽</span>
      </div>

      {/* В демо-режиме не показываем ошибки подключения */}
      {mutation.error && !mutation.error.message?.includes('демо-режим') && (
        <ErrorMessage
          title="Ошибка при создании подписки"
          message={
            mutation.error instanceof Error
              ? mutation.error.message
              : 'Не удалось создать подписку. Попробуйте позже.'
          }
          onRetry={() => mutation.reset()}
        />
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? t('common.loading') : t('donate.continue')}
      </button>

      {/* Форма оплаты подписки */}
      {showPaymentForm && subscriptionData && subscriptionData.amount && subscriptionData.amount > 0 && (
        <div className="payment-form-wrapper">
          <PaymentForm
            amount={subscriptionData.amount}
            currency="RUB"
            donationType="subscription"
            donationData={{ 
              plan_id: subscriptionData.plan_id, 
              period: subscriptionData.period 
            }}
            onSuccess={() => {
              setShowPaymentForm(false)
              setSubscriptionData(null)
              toast.success('Подписка успешно оформлена! Спасибо! 🙏', 5000)
              onSuccess?.('subscription_success')
            }}
            onCancel={() => {
              setShowPaymentForm(false)
              setSubscriptionData(null)
            }}
          />
        </div>
      )}
    </form>
  )
}

export default SubscriptionForm

