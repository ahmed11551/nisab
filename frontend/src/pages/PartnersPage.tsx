import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { partnersApi } from '../services/api'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import CardSkeleton from '../components/CardSkeleton'
import './PartnersPage.css'

const PartnersPage = () => {
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCategories] = useState<string[]>([])

  const { data: countries, error: countriesError } = useQuery(
    'partner-countries',
    () => partnersApi.getCountries().then((res) => {
      // Поддержка формата: { success: true, data: [...] } или [...]
      return Array.isArray(res.data) ? res.data : (res.data?.data || res.data)
    }),
    {
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Failed to load countries:', error)
      },
    }
  )

  const { data: funds, isLoading, error: fundsError, refetch } = useQuery(
    ['partner-funds', selectedCountry, selectedCategories],
    () =>
      partnersApi
        .getFunds({
          country: selectedCountry || undefined,
          categories: selectedCategories.join(',') || undefined,
        })
        .then((res) => {
          // Поддержка формата: { success: true, data: {...} } или {...}
          return res.data?.data || res.data
        }),
    {
      enabled: true,
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Failed to load funds:', error)
      },
    }
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
        <CardSkeleton variant="partner" count={5} />
      ) : fundsError || countriesError ? (
        <ErrorMessage
          title="Ошибка загрузки данных"
          message={
            fundsError || countriesError
              ? (fundsError instanceof Error ? fundsError.message : countriesError instanceof Error ? countriesError.message : 'Не удалось загрузить данные')
              : 'Не удалось загрузить список фондов-партнёров'
          }
          onRetry={() => {
            if (fundsError) refetch()
          }}
        />
      ) : (
        <>
          <div className="funds-list">
            {funds?.items && funds.items.length > 0 ? (
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
              <EmptyState
                icon="🤝"
                title="Фонды-партнёры не найдены"
                description={
                  selectedCountry || selectedCategories.length > 0
                    ? 'Попробуйте выбрать другую страну или категорию'
                    : 'В данный момент нет доступных фондов-партнёров'
                }
                action={
                  <Link to="/partners/apply" className="apply-link">
                    {t('partners.apply')} - Стать партнёром
                  </Link>
                }
              />
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

