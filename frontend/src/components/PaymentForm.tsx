import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import './PaymentForm.css'

export type PaymentMethod = 'card' | 'sbp' | 'qr'

interface PaymentFormData {
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  cardHolder: string
  bank?: string
}

interface PaymentFormProps {
  amount: number
  currency?: string
  onSuccess: () => void
  onCancel?: () => void
}

const BANKS = [
  { id: 'sber', name: 'Сбербанк', logo: '🏦' },
  { id: 'vtb', name: 'ВТБ', logo: '🏦' },
  { id: 'tinkoff', name: 'Тинькофф', logo: '🏦' },
  { id: 'alfabank', name: 'Альфа-Банк', logo: '🏦' },
  { id: 'gazprombank', name: 'Газпромбанк', logo: '🏦' },
  { id: 'raiffeisen', name: 'Райффайзенбанк', logo: '🏦' },
  { id: 'yoomoney', name: 'ЮMoney', logo: '💰' },
  { id: 'other', name: 'Другой банк', logo: '🏦' },
]

// Валидация номера карты (алгоритм Луна)
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) return false
  if (!/^\d+$/.test(cleaned)) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Форматирование номера карты
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '')
  const groups = cleaned.match(/.{1,4}/g) || []
  return groups.join(' ').substring(0, 19)
}

// Форматирование даты (MM/YY)
const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
  }
  return cleaned
}

const PaymentForm = ({ amount, currency = 'RUB', onSuccess, onCancel, donationType, donationData }: PaymentFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [selectedBank, setSelectedBank] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [qrCodeValue, setQrCodeValue] = useState<string>('')
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolder: '',
      bank: '',
    },
  })

  const cardNumber = watch('cardNumber')
  const cardExpiry = watch('cardExpiry')

  // Генерация QR-кода для демо
  const generateQRCode = () => {
    const qrData = `payment://demo?amount=${amount}&currency=${currency}&timestamp=${Date.now()}&merchant=Nisab`
    return qrData
  }

  // Обновление QR-кода при изменении метода оплаты
  useEffect(() => {
    if (paymentMethod === 'qr') {
      const newQr = generateQRCode()
      setQrCodeValue(newQr)
    }
  }, [paymentMethod]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: PaymentFormData) => {
    setProcessing(true)
    
    // Имитация обработки платежа
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Проверка валидности данных
    if (paymentMethod === 'card') {
      const cleanedCardNumber = data.cardNumber.replace(/\s/g, '')
      if (!validateCardNumber(cleanedCardNumber)) {
        setProcessing(false)
        toast.error('Неверный номер карты. Проверьте данные.')
        return
      }
      
      if (data.cardCvv.length !== 3) {
        setProcessing(false)
        toast.error('CVV должен содержать 3 цифры')
        return
      }
    }

    if (paymentMethod === 'sbp' && !selectedBank) {
      setProcessing(false)
      toast.warning('Выберите банк для оплаты через СБП')
      return
    }

    // Имитация успешной оплаты
    setTimeout(async () => {
      setProcessing(false)
      
      // Добавляем запись в историю (если в демо-режиме)
      if (typeof window !== 'undefined' && donationType && donationData) {
        const { isDemoMode } = await import('../data/demoData')
        if (isDemoMode()) {
          const { mockApi } = await import('../services/mockApi')
          
          try {
            // Добавляем в историю после успешной оплаты
            if ('addPaymentToHistory' in (mockApi.donations as any)) {
              await (mockApi.donations as any).addPaymentToHistory({
                type: donationType,
                amount: { value: amount, currency },
                fund_id: donationData.fund_id,
                campaign_id: donationData.campaign_id,
                calculation_id: donationData.calculation_id,
                plan_id: donationData.plan_id,
                period: donationData.period,
              })
            }
          } catch (e) {
            console.warn('Could not add to history in demo mode:', e)
          }
        }
      }
      
      toast.success('Платеж успешно обработан!', 4000)
      onSuccess()
    }, 2000)
  }

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h2>Оплата {amount} {currency === 'RUB' ? '₽' : currency}</h2>
        {onCancel && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      {/* Выбор способа оплаты */}
      <div className="payment-methods">
        <button
          type="button"
          className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          <span className="method-icon">💳</span>
          <span>Банковская карта</span>
        </button>
        <button
          type="button"
          className={`method-btn ${paymentMethod === 'sbp' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('sbp')}
        >
          <span className="method-icon">📱</span>
          <span>СБП (Быстрая оплата)</span>
        </button>
        <button
          type="button"
          className={`method-btn ${paymentMethod === 'qr' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('qr')}
        >
          <span className="method-icon">📲</span>
          <span>QR-код</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
        {/* Оплата картой */}
        {paymentMethod === 'card' && (
          <div className="payment-section card-section">
            <div className="form-group">
              <label>Номер карты</label>
              <input
                type="text"
                {...register('cardNumber', {
                  required: 'Введите номер карты',
                  validate: (value) => {
                    const cleaned = value.replace(/\s/g, '')
                    if (cleaned.length < 13 || cleaned.length > 19) {
                      return 'Номер карты должен содержать 13-19 цифр'
                    }
                    if (!validateCardNumber(cleaned)) {
                      return 'Неверный номер карты'
                    }
                    return true
                  },
                })}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  setValue('cardNumber', formatted)
                }}
                className={errors.cardNumber ? 'error' : ''}
              />
              {errors.cardNumber && (
                <span className="error-message">{errors.cardNumber.message}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Срок действия</label>
                <input
                  type="text"
                  {...register('cardExpiry', {
                    required: 'Введите срок действия',
                    pattern: {
                      value: /^\d{2}\/\d{2}$/,
                      message: 'Формат: ММ/ГГ',
                    },
                    validate: (value) => {
                      const [month, year] = value.split('/')
                      const cardDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
                      const now = new Date()
                      if (cardDate < now) {
                        return 'Карта просрочена'
                      }
                      return true
                    },
                  })}
                  placeholder="ММ/ГГ"
                  maxLength={5}
                  onChange={(e) => {
                    const formatted = formatExpiry(e.target.value)
                    setValue('cardExpiry', formatted)
                  }}
                  className={errors.cardExpiry ? 'error' : ''}
                />
                {errors.cardExpiry && (
                  <span className="error-message">{errors.cardExpiry.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  {...register('cardCvv', {
                    required: 'Введите CVV',
                    pattern: {
                      value: /^\d{3}$/,
                      message: 'CVV должен содержать 3 цифры',
                    },
                  })}
                  placeholder="000"
                  maxLength={3}
                  className={errors.cardCvv ? 'error' : ''}
                />
                {errors.cardCvv && (
                  <span className="error-message">{errors.cardCvv.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Имя держателя карты</label>
              <input
                type="text"
                {...register('cardHolder', {
                  required: 'Введите имя держателя',
                  pattern: {
                    value: /^[A-ZА-ЯЁ\s]+$/i,
                    message: 'Только буквы',
                  },
                })}
                placeholder="IVAN IVANOV"
                className={errors.cardHolder ? 'error' : ''}
              />
              {errors.cardHolder && (
                <span className="error-message">{errors.cardHolder.message}</span>
              )}
            </div>

            {/* Демо карты */}
            <div className="demo-cards-hint">
              <p>💡 <strong>Демо-карты для тестирования:</strong></p>
              <ul>
                <li>Успешная оплата: <code>5555 5555 5555 4444</code></li>
                <li>Недостаточно средств: <code>4000 0000 0000 9995</code></li>
                <li>Карта отклонена: <code>4000 0000 0000 0002</code></li>
                <li>Любой CVV (например: 123)</li>
                <li>Любая дата в будущем (например: 12/25)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Оплата через СБП */}
        {paymentMethod === 'sbp' && (
          <div className="payment-section sbp-section">
            <div className="form-group">
              <label>Выберите банк</label>
              <div className="banks-grid">
                {BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    className={`bank-btn ${selectedBank === bank.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedBank(bank.id)
                      setValue('bank', bank.id)
                    }}
                  >
                    <span className="bank-logo">{bank.logo}</span>
                    <span className="bank-name">{bank.name}</span>
                  </button>
                ))}
              </div>
              {errors.bank && (
                <span className="error-message">Выберите банк</span>
              )}
            </div>

            {selectedBank && (
              <div className="sbp-instructions">
                <p>1. Откройте мобильное приложение вашего банка</p>
                <p>2. Выберите "Быстрая оплата" или "СБП"</p>
                <p>3. Отсканируйте QR-код или введите номер телефона</p>
                <p>4. Подтвердите оплату {amount} ₽</p>
              </div>
            )}

            <input type="hidden" {...register('bank', { required: paymentMethod === 'sbp' })} />
          </div>
        )}

        {/* Оплата QR-кодом */}
        {paymentMethod === 'qr' && (
          <div className="payment-section qr-section">
            <div className="qr-code-container">
              <div className="qr-code-wrapper">
                {qrCodeValue && (
                  <QRCodeSVG 
                    value={qrCodeValue} 
                    size={250} 
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <p className="qr-amount">Сумма: {amount} ₽</p>
              <p className="qr-instructions">
                Отсканируйте QR-код в мобильном приложении банка для оплаты
              </p>
              <button
                type="button"
                className="refresh-qr-btn"
                onClick={() => {
                  // Обновление QR-кода
                  setQrCodeValue(generateQRCode())
                }}
              >
                🔄 Обновить QR-код
              </button>
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="payment-actions">
          {onCancel && (
            <button type="button" className="cancel-payment-btn" onClick={onCancel}>
              Отмена
            </button>
          )}
          <button
            type="submit"
            className="submit-payment-btn"
            disabled={processing || (paymentMethod === 'sbp' && !selectedBank)}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Обработка...
              </>
            ) : (
              <>
                {paymentMethod === 'card' && 'Оплатить картой'}
                {paymentMethod === 'sbp' && 'Подтвердить оплату через СБП'}
                {paymentMethod === 'qr' && 'Я оплатил по QR-коду'}
              </>
            )}
          </button>
        </div>

        {/* Безопасность */}
        <div className="payment-security">
          <p>🔒 Безопасная оплата. Данные защищены по стандарту PCI DSS</p>
          <p className="demo-notice">⚠️ Демо-режим: платежи не обрабатываются</p>
        </div>
      </form>
    </div>
  )
}

export default PaymentForm

