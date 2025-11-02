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

  const periods = [
    { value: 'P1M', label: '1 месяц', price: { rub: 290, usd: 3 } },
    { value: 'P3M', label: '3 месяца', price: { rub: 870, usd: 9 } },
    { value: 'P6M', label: '6 месяцев', price: { rub: 1160, usd: 9 }, bonus: '+2 мес' },
    { value: 'P12M', label: '12 месяцев', price: { rub: 2610, usd: 27 }, bonus: '+3 мес' },
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

