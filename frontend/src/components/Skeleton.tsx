import './Skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
  lines?: number
  variant?: 'text' | 'circular' | 'rectangular'
}

const Skeleton = ({
  width = '100%',
  height,
  borderRadius,
  className = '',
  lines,
  variant = 'rectangular',
}: SkeletonProps) => {
  if (lines && lines > 1) {
    return (
      <div className={`skeleton-lines ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton skeleton-${variant}`}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              height: height || '16px',
              borderRadius: borderRadius || (variant === 'circular' ? '50%' : '4px'),
              marginBottom: i < lines - 1 ? '8px' : '0',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height || '20px',
        borderRadius: borderRadius || (variant === 'circular' ? '50%' : '4px'),
      }}
    />
  )
}

export default Skeleton

