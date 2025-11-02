import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { partnersApi } from '../services/api'
import './PartnersPage.css'

const PartnersPage = () => {
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const { data: countries } = useQuery('partner-countries', () =>
    partnersApi.getCountries().then((res) => res.data)
  )

  const { data: funds, isLoading } = useQuery(
    ['partner-funds', selectedCountry, selectedCategories],
    () =>
      partnersApi
        .getFunds({
          country: selectedCountry || undefined,
          categories: selectedCategories.join(',') || undefined,
        })
        .then((res) => res.data),
    { enabled: true }
  )

  return (
    <div className="partners-page">
      <h1>{t('partners.title')}</h1>

      <div className="partners-filters">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('partners.application.country')}</option>
          {countries?.map((country: any) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="funds-list">
            {funds?.items?.length > 0 ? (
              funds.items.map((fund: any) => (
                <div key={fund.id} className="fund-card">
                  {fund.logo_url && (
                    <img src={fund.logo_url} alt={fund.name} className="fund-logo" />
                  )}
                  <div className="fund-info">
                    <div className="fund-header">
                      <h3>{fund.name}</h3>
                      {fund.verified && (
                        <span className="badge verified">✓ {t('partners.verified')}</span>
                      )}
                    </div>
                    <p className="fund-description">{fund.short_desc}</p>
                    <div className="fund-meta">
                      <span className="country">{fund.country_code}</span>
                      {fund.categories?.map((cat: string) => (
                        <span key={cat} className="category">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="fund-actions">
                      <button className="btn-secondary">{t('partners.details')}</button>
                      <button className="btn-primary">{t('partners.donate')}</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>{t('partners.noPartners')}</p>
                <Link to="/partners/apply" className="apply-link">
                  {t('partners.apply')}
                </Link>
              </div>
            )}
          </div>

          <div className="cta-banner">
            <p>Хотите стать партнёром?</p>
            <Link to="/partners/apply" className="apply-btn">
              {t('partners.apply')}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default PartnersPage

