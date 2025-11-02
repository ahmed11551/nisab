// Mock API для работы приложения без бэкенда
// Имитирует работу реального API
// Данные сохраняются в памяти для реалистичной работы

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

// Хранилище данных в памяти для демо-режима (позволяет добавлять/изменять данные)
let inMemoryFunds = [...DEMO_FUNDS]
let inMemoryCampaigns = [...DEMO_CAMPAIGNS]
let inMemoryPartners = [...DEMO_PARTNERS]
let inMemoryHistory = [...DEMO_HISTORY]
let inMemoryReports = [...DEMO_REPORTS]

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
      let funds = [...inMemoryFunds]

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
      const fund = inMemoryFunds.find(f => f.id === id)
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
      let campaigns = [...inMemoryCampaigns]

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
      const campaign = inMemoryCampaigns.find(c => c.id === id)
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
        owner_id: 'demo-user-current',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      inMemoryCampaigns.push(newCampaign) // Сохраняем в память
      return mockResponse({
        success: true,
        data: { id: newCampaign.id, ...newCampaign },
      })
    },

    donate: async (id: string, data: any) => {
      const campaign = inMemoryCampaigns.find(c => c.id === id)
      if (!campaign) {
        return mockResponse({
          success: false,
          error: { message: 'Campaign not found' },
        }, 404)
      }
      
      // Обновляем кампанию
      campaign.collected_amount = (campaign.collected_amount || 0) + data.amount.value
      campaign.participant_count = (campaign.participant_count || 0) + 1
      campaign.updated_at = new Date().toISOString()
      
      // Добавляем запись в историю
      inMemoryHistory.push({
        id: `demo-history-campaign-${Date.now()}`,
        type: 'campaign',
        amount_value: data.amount.value,
        currency: data.amount.currency || 'RUB',
        status: 'paid',
        campaign_id: id,
        campaign_title: campaign.title,
        fund_id: campaign.fund_id,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      
      return mockResponse({
        success: true,
        data: {
          donation_id: `demo-campaign-donation-${Date.now()}`,
          status: 'paid',
          amount: data.amount,
        },
      })
    },

    getReport: async (id: string) => {
      const campaign = inMemoryCampaigns.find(c => c.id === id)
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
          collected_amount: campaign.collected_amount || 0,
          goal_amount: campaign.goal_amount,
          participant_count: campaign.participant_count || 0,
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
      let partners = [...inMemoryFunds].filter(f => f.partner_enabled)

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
      const newApplication = {
        id: `demo-partner-app-${Date.now()}`,
        ...data,
        status: 'received',
        created_at: new Date().toISOString(),
      }
      inMemoryPartners.push(newApplication) // Сохраняем в память
      return mockResponse({
        success: true,
        data: {
          application_id: newApplication.id,
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
      let history = [...inMemoryHistory]
      
      // Преобразуем формат для совместимости
      history = history.map(h => ({
        id: h.id,
        type: h.type,
        date: h.created_at || h.paid_at,
        amount: { value: h.amount_value, currency: h.currency || 'RUB' },
        status: h.status,
        fund_name: h.fund_name || (h.fund_id ? inMemoryFunds.find(f => f.id === h.fund_id)?.name : null),
        campaign_title: h.campaign_title || null,
        receipt_url: h.receipt_url || `https://demo-receipt.example.com/${h.id}`,
      }))

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
      let reports = [...inMemoryReports]

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
      // Вычисляем реальную статистику из данных
      const totalCollected = inMemoryHistory
        .filter(h => h.status === 'paid')
        .reduce((sum, h) => sum + (h.amount_value || 0), 0)
      
      const totalDistributed = Math.floor(totalCollected * 0.85) // 85% распределено
      
      return mockResponse({
        success: true,
        data: {
          total_collected: totalCollected || 1000000,
          total_distributed: totalDistributed || 850000,
          total_campaigns: inMemoryCampaigns.length,
          total_funds: inMemoryFunds.length,
          period: params?.period || 'monthly',
        },
      })
    },
  },

  // Donations API
  donations: {
    init: async (data: any) => {
      const donationId = `demo-donation-${Date.now()}`
      
      // В демо-режиме возвращаем donation_id для дальнейшей обработки через PaymentForm
      // История будет добавлена после успешной оплаты через addPaymentToHistory
      
      return mockResponse({
        success: true,
        data: {
          donation_id: donationId,
          payment_url: null, // В демо-режиме показываем форму оплаты, а не payment_url
        },
      })
    },
    
    // Метод для добавления записи в историю после успешной оплаты
    addPaymentToHistory: async (data: { 
      fund_id?: string
      campaign_id?: string
      calculation_id?: string
      plan_id?: string
      period?: string
      amount: { value: number; currency: string }
      type: 'donation' | 'campaign' | 'zakat' | 'subscription'
    }) => {
      const fund = data.fund_id ? inMemoryFunds.find(f => f.id === data.fund_id) : null
      const campaign = data.campaign_id ? inMemoryCampaigns.find(c => c.id === data.campaign_id) : null
      
      inMemoryHistory.push({
        id: `demo-history-${data.type}-${Date.now()}`,
        type: data.type,
        amount_value: data.amount.value,
        currency: data.amount.currency,
        status: 'paid',
        fund_id: data.fund_id || campaign?.fund_id,
        fund_name: fund?.name || campaign?.fund_id ? inMemoryFunds.find(f => f.id === campaign?.fund_id)?.name : null,
        campaign_id: data.campaign_id,
        campaign_title: campaign?.title,
        plan: data.plan_id,
        period: data.period,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      
      return Promise.resolve({ success: true })
    },

    getStatus: async (donationId: string) => {
      // Ищем в истории по donation_id или похожему id
      const historyItem = inMemoryHistory.find(h => 
        h.id === donationId || 
        h.id.includes(donationId) ||
        donationId.includes(h.id)
      )
      
      return mockResponse({
        success: true,
        data: {
          status: historyItem?.status || 'paid',
          donation_id: donationId,
          amount: historyItem ? { 
            value: historyItem.amount_value, 
            currency: historyItem.currency || 'RUB' 
          } : null,
        },
      })
    },
  },

  // Subscriptions API
  subscriptions: {
    init: async (data: any) => {
      const subscriptionId = `demo-sub-${Date.now()}`
      
      // После успешной оплаты через PaymentForm данные будут добавлены в историю
      
      return mockResponse({
        success: true,
        data: {
          subscription_id: subscriptionId,
          provider: 'yookassa',
          confirmation_url: null, // В демо-режиме показываем форму оплаты
        },
      })
    },

    list: async () => {
      // Получаем активные подписки из истории
      const activeSubscriptions = inMemoryHistory
        .filter(h => h.type === 'subscription' && h.status === 'paid')
        .map((h, index) => ({
          id: `demo-sub-${index + 1}`,
          plan: h.plan || 'basic',
          period: h.period || 'P1M',
          status: 'active',
          next_charge_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: h.created_at,
        }))
        .reverse() // Новые первыми
        .slice(0, 10) // Максимум 10
      
      return mockResponse({
        success: true,
        data: {
          items: activeSubscriptions,
          total: activeSubscriptions.length,
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
      // После успешной оплаты через PaymentForm данные будут добавлены в историю
      // Здесь просто возвращаем успешный ответ
      
      return mockResponse({
        success: true,
        data: {
          donation_id: `demo-zakat-donation-${Date.now()}`,
          status: 'paid',
          amount: data.amount,
        },
      })
    },
  },
}

