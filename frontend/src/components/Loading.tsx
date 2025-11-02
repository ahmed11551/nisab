import './Loading.css'

interface LoadingProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

const Loading = ({ message = 'Загрузка...', size = 'medium' }: LoadingProps) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default Loading

