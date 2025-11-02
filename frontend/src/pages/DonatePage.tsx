import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { fundsApi } from '../services/api'
import DonationForm from '../components/DonationForm'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import './DonatePage.css'

// Демо-данные для визуальной оценки карточек фондов
const DEMO_FUNDS = [
  {
    id: 'demo-fund-1',
    name: 'Фонд помощи нуждающимся',
    short_desc: 'Оказание помощи нуждающимся семьям, сиротам и пожилым людям',
    logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200',
    country_code: 'RU',
    verified: true,
    categories: ['orphans', 'intl'],
  },
  {
    id: 'demo-fund-2',
    name: 'Образовательный фонд',
    short_desc: 'Поддержка образования мусульманской молодежи и студентов',
    logo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200',
    country_code: 'KZ',
    verified: true,
    categories: ['education'],
  },
  {
    id: 'demo-fund-3',
    name: 'Фонд мечетей',
    short_desc: 'Строительство и ремонт мечетей в регионах',
    logo_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=200',
    country_code: 'RU',
    verified: false,
    categories: ['mosque'],
  },
]

const DonatePage = () => {
  const { t } = useTranslation()
  const [selectedFund, setSelectedFund] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [filters, setFilters] = useState({
    country: '',
    purpose: '',
    query: '',
  })

  const { data: funds, isLoading, error, refetch } = useQuery(
    ['funds', filters],
    () =>
      fundsApi
        .list({
          country: filters.country || undefined,
          purpose: filters.purpose || undefined,
          query: filters.query || undefined,
        })
        .then((res) => res.data),
    {
      enabled: true,
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        console.error('Failed to load funds:', err)
      },
    }
  )

  // Используем демо-данные если нет реальных данных или API не отвечает
  const displayFunds = funds?.items && funds.items.length > 0 
    ? funds.items 
    : (!isLoading && !error ? DEMO_FUNDS : [])

  const amountPresets = [100, 250, 500, 1000]

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

  return (
    <div className="donate-page">
      <h1>{t('donate.title')}</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Поиск фонда..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="filter-select"
        >
          <option value="">Все страны</option>
          <option value="RU">Россия</option>
          <option value="KZ">Казахстан</option>
          <option value="UZ">Узбекистан</option>
          <option value="TJ">Таджикистан</option>
          <option value="TR">Турция</option>
          <option value="SA">Саудовская Аравия</option>
          <option value="AE">ОАЭ</option>
        </select>
        <select
          value={filters.purpose}
          onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
          className="filter-select"
        >
          <option value="">Все цели</option>
          <option value="mosque">Мечеть</option>
          <option value="orphans">Сироты</option>
          <option value="education">Обучение</option>
          <option value="intl">Международная помощь</option>
          <option value="foundation_needs">Потребности фонда</option>
        </select>
      </div>

      {/* Funds List */}
      {isLoading ? (
        <Loading message="Загрузка фондов..." />
      ) : error ? (
        <ErrorMessage
          title="Ошибка загрузки фондов"
          message={error instanceof Error ? error.message : 'Не удалось загрузить список фондов'}
          onRetry={() => refetch()}
        />
      ) : displayFunds.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Фонды не найдены"
          description={
            filters.country || filters.purpose || filters.query
              ? 'Попробуйте изменить фильтры поиска'
              : 'Нет доступных фондов в данный момент'
          }
        />
      ) : (
        <div className="funds-list">
          {displayFunds.length > 0 && displayFunds[0].id?.startsWith('demo-') && (
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
          {displayFunds.map((fund: any) => (
            <div
              key={fund.id}
              className={`fund-card ${selectedFund === fund.id ? 'selected' : ''}`}
              onClick={() => setSelectedFund(fund.id)}
            >
              {fund.logo_url && (
                <img src={fund.logo_url} alt={fund.name} className="fund-logo" />
              )}
              <div className="fund-info">
                <h3>{fund.name}</h3>
                <p className="fund-description">{fund.short_desc}</p>
                <div className="fund-badges">
                  {fund.verified && (
                    <span className="badge verified">✓ {t('partners.verified')}</span>
                  )}
                  <span className="badge country">{fund.country_code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Amount Selection */}
      {selectedFund && (
        <div className="amount-selection">
          <h2>{t('donate.selectAmount')}</h2>
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
          {amount && selectedFund && (
            <DonationForm fundId={selectedFund} />
          )}
        </div>
      )}
    </div>
  )
}

export default DonatePage

