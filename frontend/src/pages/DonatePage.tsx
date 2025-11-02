import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { fundsApi } from '../services/api'
import DonationForm from '../components/DonationForm'
import './DonatePage.css'

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

  const { data: funds, isLoading } = useQuery(
    ['funds', filters],
    () =>
      fundsApi
        .list({
          country: filters.country || undefined,
          purpose: filters.purpose || undefined,
          query: filters.query || undefined,
        })
        .then((res) => res.data),
    { enabled: true }
  )

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
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <div className="funds-list">
          {funds?.items?.map((fund: any) => (
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

