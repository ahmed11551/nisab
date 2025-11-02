import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { campaignsApi, fundsApi } from '../services/api'
import './HomePage.css'

const HomePage = () => {
  const { t } = useTranslation()

  // Получаем статистику для главной страницы
  const { data: recentCampaigns } = useQuery(
    'home-campaigns',
    () => campaignsApi.list({ status: 'active', size: 3 }).then((res) => res.data),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  )

  const { data: topFunds } = useQuery(
    'home-funds',
    () => fundsApi.list({ size: 3 }).then((res) => res.data),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  )

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Nisab - Садака Пасс</h1>
        <p>Ваша регулярная милостыня и помощь нуждающимся</p>
      </div>

      {/* Статистика */}
      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-value">{topFunds?.total || 0}</div>
          <div className="stat-label">Фондов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{recentCampaigns?.total || 0}</div>
          <div className="stat-label">Кампаний</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">∞</div>
          <div className="stat-label">Добрых дел</div>
        </div>
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

