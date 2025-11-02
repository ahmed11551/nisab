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
    { path: '/donate', label: t('nav.donate'), icon: '💵', shortLabel: 'Донат' },
    { path: '/support', label: t('nav.support'), icon: '❤️', shortLabel: 'Поддержка' },
    { path: '/campaigns', label: t('nav.campaigns'), icon: '🎯', shortLabel: 'Кампании' },
    { path: '/subscription', label: t('nav.subscription'), icon: '📅', shortLabel: 'Подписка' },
    { path: '/zakat', label: t('nav.zakat'), icon: '📊', shortLabel: 'Закят' },
    { path: '/history', label: t('nav.history'), icon: '📜', shortLabel: 'История' },
    { path: '/partners', label: t('nav.partners'), icon: '🤝', shortLabel: 'Партнёры' },
  ]

  return (
    <div className="layout">
      <main className="layout-main">{children}</main>
      <nav className="layout-nav">
        <div className="nav-scroll">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`nav-item ${location.pathname.startsWith(tab.path) ? 'active' : ''}`}
              title={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.shortLabel}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Layout

