import { useTranslation } from 'react-i18next'
import SubscriptionForm from '../components/SubscriptionForm'
import './SubscriptionPage.css'

const SubscriptionPage = () => {
  const { t } = useTranslation()

  const plans = [
    {
      id: 'basic',
      name: t('subscription.basic'),
      features: ['Базовые духовные функции', 'Навигация, напоминания, кибла'],
      charity: null,
    },
    {
      id: 'pro',
      name: t('subscription.pro'),
      features: [
        'Всё из Базового',
        'Доп. курсы/аналитика/геймификация',
        `${t('subscription.charity')}: 5%`,
      ],
      charity: 5,
    },
    {
      id: 'premium',
      name: t('subscription.premium'),
      features: [
        'Всё из Pro',
        'Эксклюзивы/ивенты/приоритетная поддержка',
        `${t('subscription.charity')}: 10%`,
      ],
      charity: 10,
    },
  ]


  return (
    <div className="subscription-page">
      <h1>{t('subscription.title')}</h1>
      <p className="subscription-description">{t('subscription.description')}</p>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SubscriptionForm
        onSuccess={(url) => {
          // Можно добавить уведомление об успехе
          console.log('Subscription payment URL:', url)
        }}
        onError={(error) => {
          // Можно добавить уведомление об ошибке
          console.error('Subscription error:', error)
        }}
      />
    </div>
  )
}

export default SubscriptionPage

