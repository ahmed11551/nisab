import { useEffect, useState } from 'react'
import { isDemoMode } from '../data/demoData'
import './DemoModeBanner.css'

const DemoModeBanner = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isDemoMode()) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="demo-mode-banner" role="banner">
      <span className="demo-icon">📦</span>
      <span className="demo-text">Демо-режим: работа с тестовыми данными</span>
      <button 
        className="demo-close" 
        onClick={() => setShow(false)}
        aria-label="Скрыть баннер"
      >
        ✕
      </button>
    </div>
  )
}

export default DemoModeBanner

