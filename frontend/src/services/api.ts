import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

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
          console.error('Network error: No response from server')
          // Create a more user-friendly error
          const networkError = new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен на http://localhost:3000')
          networkError.name = 'NetworkError'
          return Promise.reject(networkError)
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', error.message)
        }
        
        // Enhance error with user-friendly message
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
  }) => apiClient.post('/donations/init', data),

  getStatus: (donationId: string) => apiClient.get(`/donations/${donationId}/status`),
}

export const subscriptionsApi = {
  init: (data: {
    plan_id: 'basic' | 'pro' | 'premium'
    period: 'P1M' | 'P3M' | 'P6M' | 'P12M'
  }) => apiClient.post('/subscriptions/init', data),

  update: (id: string, action: 'pause' | 'resume' | 'cancel') =>
    apiClient.patch(`/subscriptions/${id}`, { action }),

  list: () => apiClient.get('/me/subscriptions'),
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
  }) => apiClient.post('/zakat/calc', data),

  pay: (data: {
    calculation_id: string
    amount: { value: number; currency: string }
  }) => apiClient.post('/zakat/pay', data),
}

export const fundsApi = {
  list: (params?: {
    country?: string
    purpose?: string
    query?: string
    from?: number
    size?: number
  }) => apiClient.get('/funds', { params }),

  get: (id: string) => apiClient.get(`/funds/${id}`),
}

export const partnersApi = {
  getCountries: () => apiClient.get('/partners/countries'),

  getFunds: (params?: {
    country?: string
    categories?: string
    search?: string
    from?: number
    size?: number
  }) => apiClient.get('/partners/funds', { params }),

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
  }) => apiClient.post('/partners/applications', data),
}

export const campaignsApi = {
  list: (params?: {
    status?: string
    country?: string
    category?: string
    from?: number
    size?: number
  }) => apiClient.get('/campaigns', { params }),

  get: (id: string) => apiClient.get(`/campaigns/${id}`),

  create: (data: {
    title: string
    description: string
    category: string
    goal_amount: number
    country_code?: string
    fund_id?: string
    end_date?: string
    image_url?: string
  }) => apiClient.post('/campaigns', data),

  donate: (id: string, data: {
    amount: { value: number; currency: string }
    payment_channel?: 'auto' | 'yookassa' | 'cloudpayments'
    card_bin?: string
  }) => apiClient.post(`/campaigns/${id}/donate`, data),

  getReport: (id: string) => apiClient.get(`/campaigns/${id}/report`),

  moderate: (id: string, action: 'approve' | 'reject') =>
    apiClient.patch(`/campaigns/${id}/status`, { action }),
}

export const reportsApi = {
  getFundReports: (params?: {
    fund_id?: string
    from?: string
    to?: string
    verified?: boolean
  }) => apiClient.get('/reports/funds', { params }),

  getReport: (id: string) => apiClient.get(`/reports/${id}`),

  getSummary: (params?: {
    period?: 'monthly' | 'quarterly' | 'yearly'
    from?: string
    to?: string
  }) => apiClient.get('/reports/summary', { params }),
}

export const historyApi = {
  get: (params?: {
    type?: 'donation' | 'subscription' | 'zakat' | 'campaign'
    period?: string
    from?: number
    size?: number
  }) => apiClient.get('/me/history', { params }),

  getReceipt: (id: string) => apiClient.get(`/me/receipts/${id}.pdf`, { responseType: 'blob' }),
}

export default apiClient

