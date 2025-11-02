import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './HomePage.css'

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Nisab - Садака Пасс</h1>
        <p>Ваша регулярная милостыня и помощь нуждающимся</p>
      </div>

      <div className="home-actions">
        <Link to="/donate" className="action-card primary">
          <span className="action-icon">💰</span>
          <span className="action-title">{t('nav.donate')}</span>
          <span className="action-description">Сделать пожертвование</span>
        </Link>

        <Link to="/support" className="action-card">
          <span className="action-icon">❤️</span>
          <span className="action-title">{t('nav.support')}</span>
          <span className="action-description">Поддержать проект</span>
        </Link>

        <Link to="/campaigns" className="action-card">
          <span className="action-icon">🎯</span>
          <span className="action-title">{t('nav.campaigns')}</span>
          <span className="action-description">Целевые кампании</span>
        </Link>

        <Link to="/subscription" className="action-card">
          <span className="action-icon">📅</span>
          <span className="action-title">{t('nav.subscription')}</span>
          <span className="action-description">Садака-подписка</span>
        </Link>

        <Link to="/zakat" className="action-card">
          <span className="action-icon">📊</span>
          <span className="action-title">{t('nav.zakat')}</span>
          <span className="action-description">Калькулятор закята</span>
        </Link>

        <Link to="/partners" className="action-card">
          <span className="action-icon">🤝</span>
          <span className="action-title">{t('nav.partners')}</span>
          <span className="action-description">Фонды-партнёры</span>
        </Link>
      </div>
    </div>
  )
}

export default HomePage

