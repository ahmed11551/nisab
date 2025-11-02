import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { campaignsApi } from '../services/api'
import CampaignDonateForm from '../components/CampaignDonateForm'
import './CampaignDetailPage.css'

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const { data: campaign, isLoading } = useQuery(
    ['campaign', id],
    () => campaignsApi.get(id!).then((res) => res.data),
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <div className="campaign-detail-page">
        <div className="loading">{t('common.loading')}</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="campaign-detail-page">
        <div className="error">Кампания не найдена</div>
      </div>
    )
  }

  const progress = (campaign.collected_amount / campaign.goal_amount) * 100

  return (
    <div className="campaign-detail-page">
      {campaign.image_url && (
        <img src={campaign.image_url} alt={campaign.title} className="campaign-hero-image" />
      )}
      <div className="campaign-content">
        <h1>{campaign.title}</h1>
        <p className="campaign-description">{campaign.description}</p>

        <div className="campaign-progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">
            <span>
              {campaign.collected_amount.toLocaleString()} / {campaign.goal_amount.toLocaleString()} ₽
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="campaign-meta">
          <span className="campaign-category">{campaign.category}</span>
          <span className="campaign-country">{campaign.country_code}</span>
        </div>

        {campaign.status === 'active' ? (
          <CampaignDonateForm
            campaignId={campaign.id}
            onSuccess={(url) => {
              // Успешный переход на оплату
              console.log('Payment URL:', url)
            }}
            onError={(error) => {
              // Можно показать уведомление об ошибке
              console.error('Donation error:', error)
            }}
          />
        ) : campaign.status === 'completed' ? (
          <div className="campaign-completed">
            <h3>Кампания завершена</h3>
            <p>Цель достигнута! Спасибо всем участникам.</p>
            <button
              className="report-btn"
              onClick={() => {
                // Показать отчет о кампании
                window.location.href = `/campaigns/${campaign.id}/report`
              }}
            >
              Посмотреть отчет
            </button>
          </div>
        ) : (
          <div className="campaign-pending">
            <p>Кампания находится на модерации. Скоро она будет опубликована.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDetailPage

