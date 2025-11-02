import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { donationsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import ErrorMessage from '../components/ErrorMessage'
import './SupportPage.css'

const SupportPage = () => {
  const { t } = useTranslation()
  const tg = useTelegramWebApp()
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [success, setSuccess] = useState(false)

  const amountPresets = [500, 1000, 2500]

  const mutation = useMutation(
    (amount: number) =>
      donationsApi.init({
        fund_id: 'support', // Специальный ID для поддержки проекта
        purpose: 'support',
        amount: { value: amount, currency: 'RUB' },
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
          setSuccess(true)
        }
      },
      onError: (error: Error) => {
        console.error('Support donation error:', error)
        const errorMessage = error.message || 'Не удалось подключиться к серверу. Проверьте, что сервер запущен на порту 3000.'
        if (tg?.showAlert) {
          tg.showAlert(errorMessage)
        } else if (typeof window !== 'undefined') {
          window.alert(errorMessage)
        }
      },
      retry: false, // Don't retry automatically to prevent stuck loading state
    }
  )

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue)
    } else {
      setAmount(null)
    }
  }

  const handleDonate = () => {
    if (amount && amount > 0) {
      mutation.mutate(amount)
    }
  }

  return (
    <div className="support-page">
      <h1>{t('nav.support')}</h1>
      <p className="support-description">
        Быстрая поддержка проекта. Ваши средства пойдут на развитие платформы.
      </p>

      <div className="amount-selection">
        <h2>Выберите сумму</h2>
        <div className="amount-presets">
          {amountPresets.map((preset) => (
            <button
              key={preset}
              className={`amount-btn ${amount === preset ? 'active' : ''}`}
              onClick={() => handleAmountSelect(preset)}
            >
              {preset} ₽
            </button>
          ))}
        </div>
        <div className="custom-amount">
          <label>{t('donate.customAmount')}</label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            placeholder="0"
            min="1"
          />
        </div>
        {success ? (
          <div className="success-message">
            <h2>Спасибо за поддержку! 🙏</h2>
            <p>Ваши средства помогут развитию платформы.</p>
            <button
              className="share-btn"
              onClick={() => {
                const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Я поддержал проект Nisab!`
                if (tg?.openLink) {
                  tg.openLink(shareUrl)
                } else if (typeof window !== 'undefined') {
                  window.open(shareUrl, '_blank')
                }
              }}
            >
              Рассказать друзьям
            </button>
          </div>
        ) : (
          <>
            {mutation.error && (
              <ErrorMessage
                title="Ошибка при поддержке проекта"
                message={
                  mutation.error instanceof Error
                    ? mutation.error.message
                    : 'Не удалось создать пожертвование. Попробуйте позже.'
                }
                onRetry={() => mutation.reset()}
              />
            )}
            {amount && (
              <button
                className="continue-btn"
                onClick={handleDonate}
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? t('common.loading') : `Поддержать ${amount} ₽`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SupportPage

