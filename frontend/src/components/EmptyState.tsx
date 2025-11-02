import { ReactNode } from 'react'
import './EmptyState.css'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

const EmptyState = ({ icon = '📭', title, description, action }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}

export default EmptyState

