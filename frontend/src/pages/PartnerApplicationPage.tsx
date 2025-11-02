import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { partnersApi } from '../services/api'
import './PartnerApplicationPage.css'

const PartnerApplicationPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    org_name: '',
    country_code: '',
    categories: [] as string[],
    website: '',
    contact_name: '',
    email: '',
    phone: '',
    about: '',
    consents: { privacy: false, terms: false },
  })

  const categories = ['mosque', 'orphans', 'intl', 'foundation_needs']
  const countries = ['RU', 'KZ', 'TR', 'UA', 'BY'] // Should be fetched from API

  const mutation = useMutation(
    (data: typeof formData) => partnersApi.submitApplication(data),
    {
      onSuccess: () => {
        // Show success message and navigate
        navigate('/partners')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const toggleCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    })
  }

  return (
    <div className="application-page">
      <h1>{t('partners.application.title')}</h1>

      <form onSubmit={handleSubmit} className="application-form">
        <label>
          {t('partners.application.orgName')} *
          <input
            type="text"
            required
            value={formData.org_name}
            onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
          />
        </label>

        <label>
          {t('partners.application.country')} *
          <select
            required
            value={formData.country_code}
            onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
          >
            <option value="">Выберите страну</option>
            {countries.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t('partners.application.categories')} *
          <div className="categories-checkboxes">
            {categories.map((cat) => (
              <label key={cat} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </label>

        <label>
          {t('partners.application.website')} *
          <input
            type="url"
            required
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </label>

        <label>
          {t('partners.application.contactName')} *
          <input
            type="text"
            required
            value={formData.contact_name}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          />
        </label>

        <label>
          {t('partners.application.email')} *
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>

        <label>
          {t('partners.application.phone')}
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </label>

        <label>
          {t('partners.application.description')}
          <textarea
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            rows={4}
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            required
            checked={formData.consents.privacy}
            onChange={(e) =>
              setFormData({
                ...formData,
                consents: { ...formData.consents, privacy: e.target.checked },
              })
            }
          />
          <span>{t('partners.application.consent')} *</span>
        </label>

        <button type="submit" className="submit-btn" disabled={mutation.isLoading}>
          {mutation.isLoading ? t('common.loading') : t('partners.application.submit')}
        </button>
      </form>
    </div>
  )
}

export default PartnerApplicationPage

