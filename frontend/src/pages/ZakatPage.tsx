import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import { zakatApi } from '../services/api'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'
import './ZakatPage.css'

const ZakatPage = () => {
  const { t } = useTranslation()
  const [assets, setAssets] = useState({
    cash_total: 0,
    gold_g: 0,
    silver_g: 0,
    business_goods_value: 0,
    investments: 0,
    receivables_collectible: 0,
  })
  const [debts, setDebts] = useState(0)
  const [zakatDue, setZakatDue] = useState<number | null>(null)

  const nisabValue = 64000 // Should be fetched from API
  const nisabCurrency = 'RUB'

  const [calculationId, setCalculationId] = useState<string | null>(null)
  const tg = useTelegramWebApp()

  const calculateMutation = useMutation(
    (data: typeof assets & { debts_short_term: number }) =>
      zakatApi.calculate({
        assets: {
          cash_total: data.cash_total || 0,
          gold_g: data.gold_g || 0,
          silver_g: data.silver_g || 0,
          business_goods_value: data.business_goods_value || 0,
          investments: data.investments || 0,
          receivables_collectible: data.receivables_collectible || 0,
        },
        debts_short_term: debts,
        nisab_currency: 'RUB',
        nisab_value: nisabValue,
        rate_percent: 2.5,
      }),
    {
      onSuccess: (response) => {
        setZakatDue(response.data.zakat_due)
        setCalculationId(response.data.calculation_id)
      },
      onError: (error: Error) => {
        console.error('Zakat calculation error:', error)
      },
    }
  )

  const payMutation = useMutation(
    (data: { calculation_id: string; amount: { value: number; currency: string } }) =>
      zakatApi.pay(data),
    {
      onSuccess: (response) => {
        if (response.data.payment_url && tg) {
          tg.openLink(response.data.payment_url)
        }
      },
      onError: (error: Error) => {
        console.error('Zakat payment error:', error)
      },
    }
  )

  const calculateZakat = () => {
    calculateMutation.mutate({ ...assets, debts_short_term: debts })
  }

  const handlePayZakat = () => {
    if (calculationId && zakatDue && zakatDue > 0) {
      payMutation.mutate({
        calculation_id: calculationId,
        amount: { value: zakatDue, currency: 'RUB' },
      })
    }
  }

  return (
    <div className="zakat-page">
      <h1>{t('zakat.title')}</h1>

      <div className="zakat-form">
        <div className="form-section">
          <h2>Денежные средства</h2>
          <label>
            Наличные, счета, электронные кошельки
            <input
              type="number"
              value={assets.cash_total || ''}
              onChange={(e) =>
                setAssets({ ...assets, cash_total: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Драгоценные металлы</h2>
          <label>
            Золото (граммы)
            <input
              type="number"
              value={assets.gold_g || ''}
              onChange={(e) =>
                setAssets({ ...assets, gold_g: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
            />
          </label>
          <label>
            Серебро (граммы)
            <input
              type="number"
              value={assets.silver_g || ''}
              onChange={(e) =>
                setAssets({ ...assets, silver_g: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Инвестиции/бизнес-товар</h2>
          <label>
            Стоимость товарных остатков
            <input
              type="number"
              value={assets.business_goods_value || ''}
              onChange={(e) =>
                setAssets({
                  ...assets,
                  business_goods_value: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              min="0"
            />
          </label>
          <label>
            Инвестиции
            <input
              type="number"
              value={assets.investments || ''}
              onChange={(e) =>
                setAssets({ ...assets, investments: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
              min="0"
            />
          </label>
          <label>
            Дебиторская задолженность
            <input
              type="number"
              value={assets.receivables_collectible || ''}
              onChange={(e) =>
                setAssets({
                  ...assets,
                  receivables_collectible: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              min="0"
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Долги к вычету</h2>
          <label>
            Краткосрочные обязательства
            <input
              type="number"
              value={debts || ''}
              onChange={(e) => setDebts(parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </label>
        </div>

        <div className="nisab-info">
          <p>
            <strong>{t('zakat.nisab')}:</strong> {nisabValue.toLocaleString()} {nisabCurrency}
          </p>
        </div>

        <button
          className="calculate-btn"
          onClick={calculateZakat}
          disabled={calculateMutation.isLoading}
        >
          {calculateMutation.isLoading ? t('common.loading') : t('zakat.calculate')}
        </button>

        {calculateMutation.error && (
          <div className="error-message">
            Ошибка расчета: {calculateMutation.error.message}
          </div>
        )}

        {zakatDue !== null && (
          <div className="zakat-result">
            <h3>{t('zakat.zakatDue')}:</h3>
            <p className="zakat-amount">{zakatDue.toLocaleString()} ₽</p>
            {zakatDue > 0 && (
              <button
                className="pay-zakat-btn"
                onClick={handlePayZakat}
                disabled={payMutation.isLoading}
              >
                {payMutation.isLoading ? t('common.loading') : t('zakat.payZakat')}
              </button>
            )}
          </div>
        )}

        <p className="disclaimer">{t('zakat.disclaimer')}</p>
      </div>
    </div>
  )
}

export default ZakatPage

