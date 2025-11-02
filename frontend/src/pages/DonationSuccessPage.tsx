import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { donationsApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import './DonationSuccessPage.css'

const DonationSuccessPage = () => {
  const { t } = useTranslation()
  const tg = useTelegramWebApp()
  const [searchParams] = useSearchParams()
  const donationId = searchParams.get('donation')
  const [success, setSuccess] = useState(false)

  const { data: donation, isLoading } = useQuery(
    ['donation', donationId],
    () => donationsApi.getStatus(donationId!).then((res) => res.data),
    { enabled: !!donationId }
  )

  useEffect(() => {
    if (donation?.status === 'paid') {
      setSuccess(true)
    }
  }, [donation])

  const handleShare = () => {
    const message = `Я поддержал ${donation?.fund?.name || 'благотворительный фонд'} на сумму ${donation?.amount || 0} ${donation?.currency || 'RUB'}. Присоединяйтесь! 🙏`
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(message)}`
    if (tg?.openLink) {
      tg.openLink(shareUrl)
    } else if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="donation-success-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="donation-success-page">
      {success ? (
        <>
          <div className="success-icon">✅</div>
          <h1>Спасибо за ваше пожертвование! 🙏</h1>
          <p className="success-message">
            Ваше пожертвование на сумму <strong>{donation?.amount} {donation?.currency}</strong> успешно принято.
          </p>
          {donation?.fund && (
            <p className="fund-name">Фонд: {donation.fund.name}</p>
          )}
          <div className="actions">
            <button onClick={handleShare} className="share-btn">
              Поделиться
            </button>
            <Link to="/donate" className="donate-again-btn">
              Пожертвовать еще
            </Link>
            <Link to="/subscription" className="subscribe-btn">
              Сделать регулярным
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="pending-icon">⏳</div>
          <h1>Обработка платежа</h1>
          <p className="pending-message">
            Ваше пожертвование обрабатывается. Пожалуйста, подождите...
          </p>
          <Link to="/history" className="history-link">
            Перейти к истории
          </Link>
        </>
      )}
    </div>
  )
}

export default DonationSuccessPage

