import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useEffect } from 'react'
import { useTelegramWebApp } from './hooks/useTelegramWebApp'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DonatePage from './pages/DonatePage'
import SupportPage from './pages/SupportPage'
import CampaignsPage from './pages/CampaignsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ZakatPage from './pages/ZakatPage'
import HistoryPage from './pages/HistoryPage'
import PartnersPage from './pages/PartnersPage'
import PartnerApplicationPage from './pages/PartnerApplicationPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import CreateCampaignPage from './pages/CreateCampaignPage'
import DonationSuccessPage from './pages/DonationSuccessPage'

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
      <BrowserRouter>
        <Layout>
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
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

