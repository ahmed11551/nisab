import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useEffect, Suspense, lazy } from 'react'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ToastContainer from './components/ToastContainer'
import DemoModeBanner from './components/DemoModeBanner'
import Loading from './components/Loading'
import './index.css'

// Lazy loading для оптимизации производительности
const HomePage = lazy(() => import('./pages/HomePage'))
const DonatePage = lazy(() => import('./pages/DonatePage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const ZakatPage = lazy(() => import('./pages/ZakatPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const PartnersPage = lazy(() => import('./pages/PartnersPage'))
const PartnerApplicationPage = lazy(() => import('./pages/PartnerApplicationPage'))
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'))
const CreateCampaignPage = lazy(() => import('./pages/CreateCampaignPage'))
const DonationSuccessPage = lazy(() => import('./pages/DonationSuccessPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const tg = useTelegramWebApp()

  useEffect(() => {
    if (tg) {
      tg.ready()
      tg.expand()
      // Устанавливаем параметры темы через themeParams
      if (tg.themeParams) {
        tg.themeParams.bg_color = '#1a1d29'
        tg.themeParams.text_color = '#ffffff'
        tg.themeParams.secondary_bg_color = '#252836'
        tg.themeParams.button_color = '#4a9eff'
        tg.themeParams.button_text_color = '#ffffff'
      }
    }
    // Принудительно устанавливаем темный фон для body
    document.body.style.backgroundColor = '#1a1d29'
    document.body.style.color = '#ffffff'
    document.documentElement.style.backgroundColor = '#1a1d29'
  }, [tg])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <DemoModeBanner />
          <Layout>
            <Suspense fallback={<Loading message="Загрузка..." />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/donate/success" element={<DonationSuccessPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="/campaigns/create" element={<CreateCampaignPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/zakat" element={<ZakatPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/partners/apply" element={<PartnerApplicationPage />} />
              </Routes>
            </Suspense>
          </Layout>
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App

