import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { campaignsApi } from '../services/api'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import CardSkeleton from '../components/CardSkeleton'
import './CampaignsPage.css'

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
        .then((res) => {
          // Поддержка формата: { success: true, data: {...} } или {...}
          return res.data?.data || res.data
        }),
    {
      enabled: true,
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        console.error('Failed to load campaigns:', err)
      },
    }
  )

  // Данные из API (включая демо-режим)
  const displayCampaigns = campaigns?.items || []

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
        <CardSkeleton variant="campaign" count={5} />
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

