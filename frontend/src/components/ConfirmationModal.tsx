import './ConfirmationModal.css'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  type = 'info',
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  const icons = {
    danger: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className={`confirmation-modal modal-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">{icons[type]}</span>
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`modal-btn modal-btn-confirm modal-btn-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal

