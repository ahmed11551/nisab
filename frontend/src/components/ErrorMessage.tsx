import { ReactNode } from 'react'
import './ErrorMessage.css'

interface ErrorMessageProps {
  title?: string
  message: string
  action?: ReactNode
  onRetry?: () => void
}

const ErrorMessage = ({ title = 'Ошибка', message, action, onRetry }: ErrorMessageProps) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Попробовать снова
        </button>
      )}
      {action && <div className="error-action">{action}</div>}
    </div>
  )
}

export default ErrorMessage

