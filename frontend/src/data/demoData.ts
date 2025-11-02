// Демо-данные для работы приложения без бэкенда
// Соответствуют структуре данных из ТЗ

export const DEMO_FUNDS = [
  {
    id: 'demo-fund-1',
    name: 'Фонд помощи нуждающимся',
    short_desc: 'Оказание помощи нуждающимся семьям, сиротам и пожилым людям',
    logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200',
    country_code: 'RU',
    verified: true,
    categories: ['orphans', 'intl'],
    purposes: ['orphans', 'intl'],
    partner_enabled: true,
    website: 'https://example-fund.ru',
    social_links: [],
    active: true,
  },
  {
    id: 'demo-fund-2',
    name: 'Образовательный фонд',
    short_desc: 'Поддержка образования мусульманской молодежи и студентов',
    logo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200',
    country_code: 'KZ',
    verified: true,
    categories: ['education'],
    purposes: ['education'],
    partner_enabled: true,
    website: 'https://education-fund.kz',
    social_links: [],
    active: true,
  },
  {
    id: 'demo-fund-3',
    name: 'Фонд мечетей',
    short_desc: 'Строительство и ремонт мечетей в регионах',
    logo_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=200',
    country_code: 'RU',
    verified: true,
    categories: ['mosque'],
    purposes: ['mosque'],
    partner_enabled: true,
    website: 'https://mosque-fund.ru',
    social_links: [],
    active: true,
  },
  {
    id: 'demo-fund-4',
    name: 'Международный фонд помощи',
    short_desc: 'Международная гуманитарная помощь по всему миру',
    logo_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200',
    country_code: 'TR',
    verified: true,
    categories: ['intl'],
    purposes: ['intl'],
    partner_enabled: true,
    website: 'https://intl-fund.org',
    social_links: [],
    active: true,
  },
  {
    id: 'demo-fund-5',
    name: 'Фонд поддержки семей',
    short_desc: 'Помощь многодетным семьям и малоимущим',
    logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200',
    country_code: 'RU',
    verified: true,
    categories: ['orphans', 'intl'],
    purposes: ['orphans'],
    partner_enabled: true,
    website: 'https://family-fund.ru',
    social_links: [],
    active: true,
  },
]

export const DEMO_CAMPAIGNS = [
  {
    id: 'demo-campaign-1',
    title: 'Ремонт мечети в Казани',
    description: 'Срочно требуется ремонт кровли и фасада исторической мечети. Необходимо собрать средства для восстановления архитектурного памятника. Мечеть была построена в 1767 году и является культурным наследием Татарстана.',
    category: 'mosque',
    country_code: 'RU',
    goal_amount: 2500000,
    collected_amount: 1250000,
    participant_count: 342,
    image_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=800',
    verified_by_admin: true,
    status: 'active',
    fund_id: 'demo-fund-3',
    owner_id: 'demo-user-1',
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-campaign-2',
    title: 'Поддержка детей-сирот',
    description: 'Сбор средств на обучение, питание и одежду для детей-сирот в детском доме. Поможем детям получить образование и найти свой путь в жизни. Средства пойдут на покупку учебников, форму, питание и медицинскую помощь.',
    category: 'orphans',
    country_code: 'RU',
    goal_amount: 500000,
    collected_amount: 325000,
    participant_count: 156,
    image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
    verified_by_admin: true,
    status: 'active',
    fund_id: 'demo-fund-1',
    owner_id: 'demo-user-2',
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-campaign-3',
    title: 'Образовательные курсы для мусульманской молодежи',
    description: 'Организация бесплатных образовательных курсов по арабскому языку, Корану и исламской этике для молодежи в регионе. Проект включает обучение 100 студентов в течение года.',
    category: 'education',
    country_code: 'KZ',
    goal_amount: 750000,
    collected_amount: 480000,
    participant_count: 89,
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    verified_by_admin: false,
    status: 'active',
    fund_id: 'demo-fund-2',
    owner_id: 'demo-user-3',
    end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-campaign-4',
    title: 'Помощь беженцам из Сирии',
    description: 'Сбор средств для помощи беженцам из Сирии: продовольствие, медицинская помощь, жилье. Проект направлен на поддержку 200 семей.',
    category: 'intl',
    country_code: 'TR',
    goal_amount: 3000000,
    collected_amount: 1850000,
    participant_count: 456,
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    verified_by_admin: true,
    status: 'active',
    fund_id: 'demo-fund-4',
    owner_id: 'demo-user-4',
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-campaign-5',
    title: 'Строительство новой мечети в деревне',
    description: 'Строительство новой мечети в небольшой деревне, где нет места для молитвы. Проект включает строительство здания на 200 человек.',
    category: 'mosque',
    country_code: 'RU',
    goal_amount: 5000000,
    collected_amount: 2100000,
    participant_count: 234,
    image_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=800',
    verified_by_admin: true,
    status: 'active',
    fund_id: 'demo-fund-3',
    owner_id: 'demo-user-5',
    end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_PARTNERS = [
  {
    id: 'demo-partner-1',
    name: 'Фонд помощи нуждающимся',
    country_code: 'RU',
    categories: ['orphans', 'intl'],
    verified: true,
    partner_enabled: true,
    logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200',
    short_desc: 'Оказание помощи нуждающимся семьям, сиротам и пожилым людям',
    website: 'https://example-fund.ru',
    social_links: ['https://vk.com/example-fund'],
  },
  {
    id: 'demo-partner-2',
    name: 'Образовательный фонд',
    country_code: 'KZ',
    categories: ['education'],
    verified: true,
    partner_enabled: true,
    logo_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200',
    short_desc: 'Поддержка образования мусульманской молодежи и студентов',
    website: 'https://education-fund.kz',
    social_links: [],
  },
  {
    id: 'demo-partner-3',
    name: 'Фонд мечетей',
    country_code: 'RU',
    categories: ['mosque'],
    verified: true,
    partner_enabled: true,
    logo_url: 'https://images.unsplash.com/photo-1564239167038-f6b73c70aec0?w=200',
    short_desc: 'Строительство и ремонт мечетей в регионах',
    website: 'https://mosque-fund.ru',
    social_links: [],
  },
  {
    id: 'demo-partner-4',
    name: 'Международный фонд помощи',
    country_code: 'TR',
    categories: ['intl'],
    verified: true,
    partner_enabled: true,
    logo_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200',
    short_desc: 'Международная гуманитарная помощь по всему миру',
    website: 'https://intl-fund.org',
    social_links: [],
  },
]

export const DEMO_HISTORY = [
  {
    id: 'demo-history-1',
    type: 'donation',
    amount_value: 1000,
    currency: 'RUB',
    status: 'paid',
    fund_id: 'demo-fund-1',
    fund_name: 'Фонд помощи нуждающимся',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    receipt_url: null,
  },
  {
    id: 'demo-history-2',
    type: 'donation',
    amount_value: 500,
    currency: 'RUB',
    status: 'paid',
    fund_id: 'demo-fund-3',
    fund_name: 'Фонд мечетей',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    receipt_url: null,
  },
  {
    id: 'demo-history-3',
    type: 'subscription',
    amount_value: 290,
    currency: 'RUB',
    status: 'paid',
    plan: 'basic',
    period: 'P1M',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-history-4',
    type: 'zakat',
    amount_value: 12500,
    currency: 'RUB',
    status: 'paid',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-history-5',
    type: 'campaign',
    amount_value: 2500,
    currency: 'RUB',
    status: 'paid',
    campaign_id: 'demo-campaign-1',
    campaign_title: 'Ремонт мечети в Казани',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_REPORTS = [
  {
    id: 'demo-report-1',
    fund_id: 'demo-fund-1',
    fund_name: 'Фонд помощи нуждающимся',
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date().toISOString(),
    total_collected: 250000,
    total_distributed: 230000,
    verified: true,
    file_url: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-report-2',
    fund_id: 'demo-fund-3',
    fund_name: 'Фонд мечетей',
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date().toISOString(),
    total_collected: 500000,
    total_distributed: 450000,
    verified: true,
    file_url: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_COUNTRIES = [
  { code: 'RU', name: 'Россия' },
  { code: 'KZ', name: 'Казахстан' },
  { code: 'TR', name: 'Турция' },
  { code: 'UZ', name: 'Узбекистан' },
  { code: 'AZ', name: 'Азербайджан' },
]

// Функция для определения, включен ли демо-режим
let demoModeCache: boolean | null = null

export const isDemoMode = () => {
  if (demoModeCache !== null) {
    return demoModeCache
  }

  const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'
  const envDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true'
  
  // Явное указание демо-режима в .env
  if (envDemoMode || apiUrl === 'demo') {
    demoModeCache = true
    return true
  }

  // В production всегда используем реальный API если не указано иначе
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // В режиме разработки ВСЕГДА используем демо-режим по умолчанию
    if (isDev) {
      demoModeCache = true
      return true
    }
    
    // В production - всегда пытаемся использовать реальный API
    if (!isDev) {
      demoModeCache = false
      return false
    }
  }

  // По умолчанию включаем демо-режим для удобства разработки и демонстрации
  demoModeCache = true
  return true
}

// Функция для принудительного включения демо-режима (вызывается при сетевых ошибках)
export const enableDemoMode = () => {
  demoModeCache = true
  if (typeof window !== 'undefined') {
    console.log('%c🔄 ДЕМО-РЕЖИМ АКТИВИРОВАН (API недоступен)', 'color: #4a9eff; font-weight: bold')
  }
}

