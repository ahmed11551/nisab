import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { campaignsApi } from '../services/api'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import './CampaignsPage.css'

// Демо-данные для визуальной оценки карточек
const DEMO_CAMPAIGNS = [
  {
    id: 'demo-1',
    title: 'Ремонт мечети в Казани',
    description: 'Срочно требуется ремонт кровли и фасада исторической мечети. Необходимо собрать средства для восстановления архитектурного памятника.',
    category: 'mosque',
    country_code: 'RU',
    goal_amount: 2500000,
    collected_amount: 1250000,
    participant_count: 342,
    image_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=800',
    verified_by_admin: true,
  },
  {
    id: 'demo-2',
    title: 'Поддержка детей-сирот',
    description: 'Сбор средств на обучение, питание и одежду для детей-сирот в детском доме. Поможем детям получить образование и найти свой путь в жизни.',
    category: 'orphans',
    country_code: 'RU',
    goal_amount: 500000,
    collected_amount: 325000,
    participant_count: 156,
    image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
    verified_by_admin: true,
  },
  {
    id: 'demo-3',
    title: 'Образовательные курсы для мусульманской молодежи',
    description: 'Организация бесплатных образовательных курсов по арабскому языку, Корану и исламской этике для молодежи в регионе.',
    category: 'education',
    country_code: 'KZ',
    goal_amount: 750000,
    collected_amount: 480000,
    participant_count: 89,
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    verified_by_admin: false,
  },
]

const CampaignsPage = () => {
  const [filters, setFilters] = useState({
    country: '',
    category: '',
    status: 'active',
  })

  const { data: campaigns, isLoading, error, refetch } = useQuery(
    ['campaigns', filters],
    () =>
      campaignsApi
        .list({
          status: filters.status,
          country: filters.country || undefined,
          category: filters.category || undefined,
        })
        .then((res) => res.data),
    {
      enabled: true,
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        console.error('Failed to load campaigns:', err)
      },
    }
  )

  // Используем демо-данные если нет реальных данных или API не отвечает
  const displayCampaigns = campaigns?.items && campaigns.items.length > 0 
    ? campaigns.items 
    : (!isLoading && !error ? DEMO_CAMPAIGNS : [])

  const categories = [
    { value: '', label: 'Все категории' },
    { value: 'mosque', label: 'Мечеть' },
    { value: 'orphans', label: 'Сироты' },
    { value: 'education', label: 'Обучение' },
    { value: 'intl', label: 'Международная помощь' },
    { value: 'foundation_needs', label: 'Потребности фонда' },
  ]

  const countries = [
    { value: '', label: 'Все страны' },
    { value: 'RU', label: 'Россия' },
    { value: 'KZ', label: 'Казахстан' },
    { value: 'UZ', label: 'Узбекистан' },
  ]

  return (
    <div className="campaigns-page">
      <div className="campaigns-header">
        <h1>Целевые кампании</h1>
        <Link to="/campaigns/create" className="create-btn">
          Создать свою цель
        </Link>
      </div>

      {/* Filters */}
      <div className="campaigns-filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="filter-select"
        >
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loading message="Загрузка кампаний..." />
      ) : error ? (
        <ErrorMessage
          title="Ошибка загрузки кампаний"
          message={error instanceof Error ? error.message : 'Не удалось загрузить список кампаний'}
          onRetry={() => refetch()}
        />
      ) : displayCampaigns.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Кампании не найдены"
          description={
            filters.country || filters.category
              ? 'Попробуйте изменить фильтры поиска'
              : 'Нет активных кампаний в данный момент'
          }
          action={
            <Link to="/campaigns/create" className="create-link">
              Создать первую кампанию
            </Link>
          }
        />
      ) : (
        <div className="campaigns-list">
          {displayCampaigns.length > 0 && displayCampaigns[0].id?.startsWith('demo-') && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '16px', 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(74, 158, 255, 0.2)',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              ⚠️ Показаны демонстрационные данные для визуальной оценки карточек
            </div>
          )}
          {displayCampaigns.map((campaign: any) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="campaign-card">
                {campaign.image_url && (
                  <img src={campaign.image_url} alt={campaign.title} className="campaign-image" />
                )}
                <div className="campaign-info">
                  <h3>{campaign.title}</h3>
                  <p className="campaign-description">{campaign.description}</p>
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min((campaign.collected_amount / campaign.goal_amount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>
                        {campaign.collected_amount?.toLocaleString() || 0} / {campaign.goal_amount?.toLocaleString() || 0}{' '}
                        ₽
                      </span>
                      <span>
                        {Math.round(
                          ((campaign.collected_amount || 0) / (campaign.goal_amount || 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="campaign-stats">
                    <span className="participants">
                      👥 {campaign.participant_count || 0} участников
                    </span>
                    {campaign.verified_by_admin && (
                      <span className="verified-badge">✓ Проверено</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}

export default CampaignsPage

