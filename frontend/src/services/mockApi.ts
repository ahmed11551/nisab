// Mock API для работы приложения без бэкенда
// Имитирует работу реального API

import {
  DEMO_FUNDS,
  DEMO_CAMPAIGNS,
  DEMO_PARTNERS,
  DEMO_HISTORY,
  DEMO_REPORTS,
  DEMO_COUNTRIES,
  isDemoMode,
} from '../data/demoData'

// Имитация задержки API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Мок ответа API
// Возвращает ответ в формате { data: { success: true, data: ... } }
// чтобы соответствовать формату реального API
const mockResponse = <T>(responseData: T, status = 200) => {
  return delay(300).then(() => ({
    status,
    statusText: 'OK',
    data: responseData, // Уже содержит { success: true, data: {...} }
    headers: {},
    config: {},
  }))
}

// Mock API клиент
export const mockApi = {
  // Funds API
  funds: {
    list: async (params?: {
      country?: string
      purpose?: string
      query?: string
      from?: number
      size?: number
    }) => {
      let funds = [...DEMO_FUNDS]

      // Фильтрация по стране
      if (params?.country) {
        funds = funds.filter(f => f.country_code === params.country)
      }

      // Фильтрация по категории
      if (params?.purpose) {
        funds = funds.filter(f => 
          f.purposes?.includes(params.purpose!) || 
          f.categories?.includes(params.purpose!)
        )
      }

      // Поиск
      if (params?.query) {
        const query = params.query.toLowerCase()
        funds = funds.filter(f => 
          f.name.toLowerCase().includes(query) ||
          f.short_desc?.toLowerCase().includes(query)
        )
      }

      // Пагинация
      const from = params?.from || 0
      const size = params?.size || 20
      const total = funds.length
      const items = funds.slice(from, from + size)

      // Возвращаем в формате как реальный API: { data: { items, total, ... } }
      // Но моки возвращают { data: { success: true, data: {...} } }
      // Поэтому нужно адаптировать для соответствия формату страниц
      const responseData = {
        success: true,
        data: {
          items,
          total,
          from,
          size,
        },
      }
      return mockResponse(responseData).then(res => ({
        ...res,
        // Для совместимости: если используется res.data, то это будет { success: true, data: {...} }
        // Но страницы ожидают { items, total, ... }, поэтому возвращаем только data часть
        data: res.data.data || res.data
      }))
    },

    get: async (id: string) => {
      const fund = DEMO_FUNDS.find(f => f.id === id)
      if (!fund) {
        return mockResponse({
          success: false,
          error: { message: 'Fund not found' },
        }, 404)
      }
      return mockResponse({
        success: true,
        data: fund,
      })
    },
  },

  // Campaigns API
  campaigns: {
    list: async (params?: {
      status?: string
      country?: string
      category?: string
      from?: number
      size?: number
    }) => {
      let campaigns = [...DEMO_CAMPAIGNS]

      // Фильтрация по статусу
      if (params?.status) {
        campaigns = campaigns.filter(c => c.status === params.status)
      }

      // Фильтрация по стране
      if (params?.country) {
        campaigns = campaigns.filter(c => c.country_code === params.country)
      }

      // Фильтрация по категории
      if (params?.category) {
        campaigns = campaigns.filter(c => c.category === params.category)
      }

      // Пагинация
      const from = params?.from || 0
      const size = params?.size || 20
      const total = campaigns.length
      const items = campaigns.slice(from, from + size)

      // Возвращаем в формате как реальный API: { data: { items, total, ... } }
      // Но моки возвращают { data: { success: true, data: {...} } }
      // Поэтому нужно адаптировать для соответствия формату страниц
      const responseData = {
        success: true,
        data: {
          items,
          total,
          from,
          size,
        },
      }
      return mockResponse(responseData).then(res => ({
        ...res,
        // Для совместимости: если используется res.data, то это будет { success: true, data: {...} }
        // Но страницы ожидают { items, total, ... }, поэтому возвращаем только data часть
        data: res.data.data || res.data
      }))
    },

    get: async (id: string) => {
      const campaign = DEMO_CAMPAIGNS.find(c => c.id === id)
      if (!campaign) {
        return mockResponse({
          success: false,
          error: { message: 'Campaign not found' },
        }, 404)
      }
      return mockResponse({
        success: true,
        data: campaign,
      })
    },

    create: async (data: any) => {
      const newCampaign = {
        id: `demo-campaign-${Date.now()}`,
        ...data,
        collected_amount: 0,
        participant_count: 0,
        status: 'pending',
        verified_by_admin: false,
        created_at: new Date().toISOString(),
      }
      return mockResponse({
        success: true,
        data: { id: newCampaign.id },
      })
    },

    donate: async (id: string, data: any) => {
      const campaign = DEMO_CAMPAIGNS.find(c => c.id === id)
      if (!campaign) {
        return mockResponse({
          success: false,
          error: { message: 'Campaign not found' },
        }, 404)
      }
      return mockResponse({
        success: true,
        data: {
          donation_id: `demo-donation-${Date.now()}`,
          provider: 'yookassa',
          payment_url: 'https://demo-payment.example.com',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      })
    },

    getReport: async (id: string) => {
      const campaign = DEMO_CAMPAIGNS.find(c => c.id === id)
      if (!campaign) {
        return mockResponse({
          success: false,
          error: { message: 'Campaign not found' },
        }, 404)
      }
      return mockResponse({
        success: true,
        data: {
          campaign_id: id,
          collected_amount: campaign.collected_amount,
          goal_amount: campaign.goal_amount,
          participant_count: campaign.participant_count,
          report_url: null,
          created_at: campaign.created_at,
        },
      })
    },
  },

  // Partners API
  partners: {
    getCountries: async () => {
      // Возвращаем массив стран напрямую (как реальный API)
      return mockResponse({
        success: true,
        data: DEMO_COUNTRIES,
      })
    },

    getFunds: async (params?: {
      country?: string
      categories?: string
      search?: string
      from?: number
      size?: number
    }) => {
      let partners = [...DEMO_PARTNERS]

      // Фильтрация по стране
      if (params?.country) {
        partners = partners.filter(p => p.country_code === params.country)
      }

      // Фильтрация по категориям
      if (params?.categories) {
        const categories = params.categories.split(',')
        partners = partners.filter(p => 
          categories.some(cat => p.categories.includes(cat))
        )
      }

      // Поиск
      if (params?.search) {
        const search = params.search.toLowerCase()
        partners = partners.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.short_desc?.toLowerCase().includes(search)
        )
      }

      // Пагинация
      const from = params?.from || 0
      const size = params?.size || 20
      const total = partners.length
      const items = partners.slice(from, from + size)

      // Возвращаем в формате как реальный API: { data: { items, total, ... } }
      // Но моки возвращают { data: { success: true, data: {...} } }
      // Поэтому нужно адаптировать для соответствия формату страниц
      const responseData = {
        success: true,
        data: {
          items,
          total,
          from,
          size,
        },
      }
      return mockResponse(responseData).then(res => ({
        ...res,
        // Для совместимости: если используется res.data, то это будет { success: true, data: {...} }
        // Но страницы ожидают { items, total, ... }, поэтому возвращаем только data часть
        data: res.data.data || res.data
      }))
    },

    submitApplication: async (data: any) => {
      return mockResponse({
        success: true,
        data: {
          application_id: `demo-app-${Date.now()}`,
          status: 'received',
        },
      })
    },
  },

  // History API
  history: {
    get: async (params?: {
      type?: 'donation' | 'subscription' | 'zakat' | 'campaign'
      period?: string
      from?: number
      size?: number
    }) => {
      let history = [...DEMO_HISTORY]

      // Фильтрация по типу
      if (params?.type) {
        history = history.filter(h => h.type === params.type)
      }

      // Пагинация
      const from = params?.from || 0
      const size = params?.size || 20
      const total = history.length
      const items = history.slice(from, from + size)

      // Возвращаем в формате как реальный API: { data: { items, total, ... } }
      // Но моки возвращают { data: { success: true, data: {...} } }
      // Поэтому нужно адаптировать для соответствия формату страниц
      const responseData = {
        success: true,
        data: {
          items,
          total,
          from,
          size,
        },
      }
      return mockResponse(responseData).then(res => ({
        ...res,
        // Для совместимости: если используется res.data, то это будет { success: true, data: {...} }
        // Но страницы ожидают { items, total, ... }, поэтому возвращаем только data часть
        data: res.data.data || res.data
      }))
    },
  },

  // Reports API
  reports: {
    getFundReports: async (params?: {
      fund_id?: string
      from?: string
      to?: string
      verified?: boolean
    }) => {
      let reports = [...DEMO_REPORTS]

      // Фильтрация по фонду
      if (params?.fund_id) {
        reports = reports.filter(r => r.fund_id === params.fund_id)
      }

      return mockResponse({
        success: true,
        data: {
          items: reports,
          total: reports.length,
        },
      })
    },

    getSummary: async (params?: {
      period?: 'monthly' | 'quarterly' | 'yearly'
      from?: string
      to?: string
    }) => {
      return mockResponse({
        success: true,
        data: {
          total_collected: 1000000,
          total_distributed: 850000,
          total_campaigns: DEMO_CAMPAIGNS.length,
          total_funds: DEMO_FUNDS.length,
          period: params?.period || 'monthly',
        },
      })
    },
  },

  // Donations API
  donations: {
    init: async (data: any) => {
      return mockResponse({
        success: true,
        data: {
          donation_id: `demo-donation-${Date.now()}`,
          provider: 'yookassa',
          payment_url: 'https://demo-payment.example.com',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      })
    },

    getStatus: async (donationId: string) => {
      return mockResponse({
        success: true,
        data: {
          status: 'paid',
          donation_id: donationId,
        },
      })
    },
  },

  // Subscriptions API
  subscriptions: {
    init: async (data: any) => {
      return mockResponse({
        success: true,
        data: {
          subscription_id: `demo-sub-${Date.now()}`,
          provider: 'yookassa',
          payment_url: 'https://demo-payment.example.com',
        },
      })
    },

    list: async () => {
      return mockResponse({
        success: true,
        data: {
          items: [],
          total: 0,
        },
      })
    },
  },

  // Zakat API
  zakat: {
    calculate: async (data: any) => {
      const { assets, debts_short_term, nisab_value, rate_percent = 2.5 } = data
      const totalAssets = 
        (assets.cash_total || 0) +
        (assets.gold_g || 0) * 5000 + // Примерная стоимость золота за грамм
        (assets.silver_g || 0) * 60 + // Примерная стоимость серебра за грамм
        (assets.business_goods_value || 0) +
        (assets.investments || 0) +
        (assets.receivables_collectible || 0)
      
      const netAssets = totalAssets - (debts_short_term || 0)
      const aboveNisab = netAssets >= nisab_value
      const zakatDue = aboveNisab ? Math.round((netAssets - nisab_value) * (rate_percent / 100)) : 0

      return mockResponse({
        success: true,
        data: {
          zakat_due: zakatDue,
          above_nisab: aboveNisab,
          net_assets: netAssets,
          calculation_id: `demo-zakat-${Date.now()}`,
        },
      })
    },

    pay: async (data: any) => {
      return mockResponse({
        success: true,
        data: {
          donation_id: `demo-zakat-donation-${Date.now()}`,
          provider: 'yookassa',
          payment_url: 'https://demo-payment.example.com',
        },
      })
    },
  },
}

