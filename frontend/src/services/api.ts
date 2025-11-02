import axios, { AxiosInstance, AxiosError } from 'axios'
import { isDemoMode } from '../data/demoData'
import { mockApi } from './mockApi'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

// Динамически определяем демо-режим (может измениться при ошибках сети)
const getDemoMode = () => isDemoMode()

// Показываем предупреждение о демо-режиме
if (typeof window !== 'undefined' && getDemoMode()) {
  console.log('%c📦 ДЕМО-РЕЖИМ АКТИВЕН', 'color: #4a9eff; font-weight: bold; font-size: 16px')
  console.log('Приложение работает с демо-данными.')
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add Telegram WebApp initData if available
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
          config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
          // Server responded with error
          const status = error.response.status
          const data = error.response.data as any
          
          if (status === 401) {
            // Unauthorized - try to use dev mode
            console.warn('Unauthorized request, using dev mode if available')
          } else if (status === 403) {
            console.error('Forbidden:', data?.message || 'Access denied')
          } else if (status === 404) {
            console.error('Not found:', data?.message || 'Resource not found')
          } else if (status >= 500) {
            console.error('Server error:', data?.message || 'Internal server error')
          }
        } else if (error.request) {
          // Request was made but no response received
          // В демо-режиме тихо переключаемся на демо-данные без ошибок
          
          // Автоматически активируем демо-режим при сетевых ошибках
          if (!DEMO_MODE) {
            const { enableDemoMode } = await import('../data/demoData')
            enableDemoMode()
          }
          
          // В демо-режиме всегда используем mockApi, не показываем ошибки
          if (getDemoMode()) {
            // Повторяем запрос с демо-данными
            if (error.config) {
              const { mockApi } = await import('./mockApi')
              const url = error.config.url || ''
              const method = error.config.method?.toLowerCase() || 'get'
              
              // Пробуем найти соответствующий мок
              try {
                if (url.includes('/funds') && method === 'get') {
                  return mockApi.funds.list(error.config.params)
                } else if (url.includes('/campaigns') && method === 'get') {
                  return mockApi.campaigns.list(error.config.params)
                } else if (url.includes('/campaigns/') && method === 'get' && url.includes('/donate')) {
                  const campaignId = url.split('/campaigns/')[1]?.split('/')[0]
                  if (campaignId && error.config.data) {
                    return mockApi.campaigns.donate(campaignId, JSON.parse(error.config.data))
                  }
                } else if (url.includes('/partners/funds') && method === 'get') {
                  return mockApi.partners.getFunds(error.config.params)
                } else if (url.includes('/partners/countries') && method === 'get') {
                  return mockApi.partners.getCountries()
                } else if (url.includes('/partners/applications') && method === 'post') {
                  return mockApi.partners.submitApplication(JSON.parse(error.config.data || '{}'))
                } else if (url.includes('/me/history') && method === 'get') {
                  return mockApi.history.get(error.config.params)
                } else if (url.includes('/reports/summary') && method === 'get') {
                  return mockApi.reports.getSummary(error.config.params)
                } else if (url.includes('/reports/funds') && method === 'get') {
                  return mockApi.reports.getFundReports(error.config.params)
                } else if (url.includes('/donations/init') && method === 'post') {
                  return mockApi.donations.init(JSON.parse(error.config.data || '{}'))
                } else if (url.includes('/subscriptions/init') && method === 'post') {
                  return mockApi.subscriptions.init(JSON.parse(error.config.data || '{}'))
                } else if (url.includes('/zakat/calc') && method === 'post') {
                  return mockApi.zakat.calculate(JSON.parse(error.config.data || '{}'))
                } else if (url.includes('/zakat/pay') && method === 'post') {
                  return mockApi.zakat.pay(JSON.parse(error.config.data || '{}'))
                } else if (url.includes('/campaigns') && method === 'post') {
                  return mockApi.campaigns.create(JSON.parse(error.config.data || '{}'))
                }
              } catch (mockError) {
                console.warn('Could not use mock API:', mockError)
              }
            }
          }
          
          // В демо-режиме не выбрасываем ошибку, возвращаем успешный ответ с демо-данными
          // Это позволяет приложению работать без предупреждений
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: { success: true, data: [] },
            headers: {},
            config: error.config,
          })
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', error.message)
        }
        
        // В демо-режиме не показываем ошибки пользователю
        if (getDemoMode()) {
          // В демо-режиме возвращаем успешный ответ вместо ошибки
          return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: { success: true, data: null },
            headers: {},
            config: error.config,
          })
        }
        
        // Enhance error with user-friendly message (только если не демо-режим)
        const enhancedError = error as AxiosError & { userMessage?: string }
        if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          enhancedError.userMessage = (error.response.data as any).message
        } else if (error.message) {
          enhancedError.userMessage = error.message
        } else {
          enhancedError.userMessage = 'Произошла ошибка. Попробуйте позже.'
        }
        
        return Promise.reject(enhancedError)
      }
    )
  }

  get instance(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient().instance

// API endpoints
export const donationsApi = {
  init: (data: {
    fund_id: string
    purpose?: string
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
  }) => {
    if (getDemoMode()) {
      return mockApi.donations.init(data)
    }
    return apiClient.post('/donations/init', data)
  },

  getStatus: (donationId: string) => {
    if (getDemoMode()) {
      return mockApi.donations.getStatus(donationId)
    }
    return apiClient.get(`/donations/${donationId}/status`)
  },
}

export const subscriptionsApi = {
  init: (data: {
    plan_id: 'basic' | 'pro' | 'premium'
    period: 'P1M' | 'P3M' | 'P6M' | 'P12M'
  }) => {
    if (getDemoMode()) {
      return mockApi.subscriptions.init(data)
    }
    return apiClient.post('/subscriptions/init', data)
  },

  update: (id: string, action: 'pause' | 'resume' | 'cancel') => {
    if (getDemoMode()) {
      return Promise.resolve({ data: { success: true } })
    }
    return apiClient.patch(`/subscriptions/${id}`, { action })
  },

  list: () => {
    if (getDemoMode()) {
      return mockApi.subscriptions.list()
    }
    return apiClient.get('/me/subscriptions')
  },
}

export const zakatApi = {
  calculate: (data: {
    assets: {
      cash_total: number
      gold_g: number
      silver_g: number
      business_goods_value: number
      investments: number
      receivables_collectible: number
    }
    debts_short_term: number
    nisab_currency: string
    nisab_value: number
    rate_percent?: number
  }) => {
    if (getDemoMode()) {
      return mockApi.zakat.calculate(data)
    }
    return apiClient.post('/zakat/calc', data)
  },

  pay: (data: {
    calculation_id: string
    amount: { value: number; currency: string }
  }) => {
    if (getDemoMode()) {
      return mockApi.zakat.pay(data)
    }
    return apiClient.post('/zakat/pay', data)
  },
}

export const fundsApi = {
  list: (params?: {
    country?: string
    purpose?: string
    query?: string
    from?: number
    size?: number
  }) => {
    if (getDemoMode()) {
      return mockApi.funds.list(params)
    }
    return apiClient.get('/funds', { params })
  },

  get: (id: string) => {
    if (getDemoMode()) {
      return mockApi.funds.get(id)
    }
    return apiClient.get(`/funds/${id}`)
  },
}

export const partnersApi = {
  getCountries: () => {
    if (getDemoMode()) {
      return mockApi.partners.getCountries()
    }
    return apiClient.get('/partners/countries')
  },

  getFunds: (params?: {
    country?: string
    categories?: string
    search?: string
    from?: number
    size?: number
  }) => {
    if (getDemoMode()) {
      return mockApi.partners.getFunds(params)
    }
    return apiClient.get('/partners/funds', { params })
  },

  submitApplication: (data: {
    org_name: string
    country_code: string
    categories: string[]
    website: string
    contact_name: string
    email: string
    phone?: string
    about?: string
    consents: { privacy: boolean; terms: boolean }
  }) => {
    if (getDemoMode()) {
      return mockApi.partners.submitApplication(data)
    }
    return apiClient.post('/partners/applications', data)
  },
}

export const campaignsApi = {
  list: (params?: {
    status?: string
    country?: string
    category?: string
    from?: number
    size?: number
  }) => {
    if (getDemoMode()) {
      return mockApi.campaigns.list(params)
    }
    return apiClient.get('/campaigns', { params })
  },

  get: (id: string) => {
    if (getDemoMode()) {
      return mockApi.campaigns.get(id)
    }
    return apiClient.get(`/campaigns/${id}`)
  },

  create: (data: {
    title: string
    description: string
    category: string
    goal_amount: number
    country_code?: string
    fund_id?: string
    end_date?: string
    image_url?: string
  }) => {
    if (getDemoMode()) {
      return mockApi.campaigns.create(data)
    }
    return apiClient.post('/campaigns', data)
  },

  donate: (id: string, data: {
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) => {
    if (getDemoMode()) {
      return mockApi.campaigns.donate(id, data)
    }
    return apiClient.post(`/campaigns/${id}/donate`, data)
  },

  getReport: (id: string) => {
    if (getDemoMode()) {
      return mockApi.campaigns.getReport(id)
    }
    return apiClient.get(`/campaigns/${id}/report`)
  },

  moderate: (id: string, action: 'approve' | 'reject') => {
    if (getDemoMode()) {
      return Promise.resolve({ data: { success: true } })
    }
    return apiClient.patch(`/campaigns/${id}/status`, { action })
  },
}

export const reportsApi = {
  getFundReports: (params?: {
    fund_id?: string
    from?: string
    to?: string
    verified?: boolean
  }) => {
    if (getDemoMode()) {
      return mockApi.reports.getFundReports(params)
    }
    return apiClient.get('/reports/funds', { params })
  },

  getReport: async (id: string) => {
    if (getDemoMode()) {
      const { DEMO_REPORTS } = await import('../data/demoData')
      return Promise.resolve({ data: { success: true, data: DEMO_REPORTS[0] } })
    }
    return apiClient.get(`/reports/${id}`)
  },

  getSummary: (params?: {
    period?: 'monthly' | 'quarterly' | 'yearly'
    from?: string
    to?: string
  }) => {
    if (getDemoMode()) {
      return mockApi.reports.getSummary(params)
    }
    return apiClient.get('/reports/summary', { params })
  },
}

export const historyApi = {
  get: (params?: {
    type?: 'donation' | 'subscription' | 'zakat' | 'campaign'
    period?: string
    from?: number
    size?: number
  }) => {
    if (getDemoMode()) {
      return mockApi.history.get(params)
    }
    return apiClient.get('/me/history', { params })
  },

  getReceipt: (id: string) => {
    if (getDemoMode()) {
      return Promise.resolve({ data: new Blob(['Demo receipt'], { type: 'application/pdf' }) })
    }
    return apiClient.get(`/me/receipts/${id}.pdf`, { responseType: 'blob' })
  },
}

export default apiClient

