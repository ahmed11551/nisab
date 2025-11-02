import Skeleton from './Skeleton'
import './CardSkeleton.css'

interface CardSkeletonProps {
  variant?: 'fund' | 'campaign' | 'partner'
  count?: number
}

const CardSkeleton = ({ variant = 'fund', count = 3 }: CardSkeletonProps) => {
  return (
    <div className="card-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`card-skeleton card-skeleton-${variant}`}>
          {variant === 'campaign' && (
            <Skeleton width="100%" height="180px" borderRadius="12px 12px 0 0" />
          )}
          <div className="card-skeleton-content">
            {variant !== 'campaign' && (
              <div className="card-skeleton-header">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="card-skeleton-title-group">
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="40%" height={16} />
                </div>
              </div>
            )}
            <div className="card-skeleton-body">
              <Skeleton width="100%" height={variant === 'campaign' ? 24 : 18} />
              <Skeleton width="90%" height={variant === 'campaign' ? 18 : 16} />
              <Skeleton width="70%" height={variant === 'campaign' ? 18 : 16} />
            </div>
            <div className="card-skeleton-footer">
              <Skeleton width="40%" height={16} />
              <Skeleton width="30%" height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton

