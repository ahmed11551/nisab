import { ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const { t } = useTranslation()

  const tabs = [
    { path: '/donate', label: t('nav.donate'), icon: '💰' },
    { path: '/support', label: t('nav.support'), icon: '❤️' },
    { path: '/campaigns', label: t('nav.campaigns'), icon: '🎯' },
    { path: '/subscription', label: t('nav.subscription'), icon: '📅' },
    { path: '/zakat', label: t('nav.zakat'), icon: '📊' },
    { path: '/history', label: t('nav.history'), icon: '📜' },
    { path: '/partners', label: t('nav.partners'), icon: '🤝' },
  ]

  return (
    <div className="layout">
      <main className="layout-main">{children}</main>
      <nav className="layout-nav">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`nav-item ${location.pathname.startsWith(tab.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Layout

