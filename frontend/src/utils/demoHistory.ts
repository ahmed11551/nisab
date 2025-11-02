// Утилита для добавления записей в историю после успешной оплаты в демо-режиме

import { isDemoMode } from '../data/demoData'

interface HistoryItem {
  type: 'donation' | 'campaign' | 'zakat' | 'subscription'
  amount_value: number
  currency: string
  fund_id?: string
  campaign_id?: string
  plan?: string
  period?: string
}

export const addToDemoHistory = async (item: HistoryItem) => {
  if (!isDemoMode()) return
  
  try {
    // Динамически импортируем для избежания циклических зависимостей
    const { default: mockApiModule } = await import('../services/mockApi')
    
    // Получаем доступ к внутреннему хранилищу через глобальную переменную или экспорт
    // Для простоты используем прямое добавление через mockApi
    if (item.type === 'donation' && item.fund_id) {
      const { mockApi } = await import('../services/mockApi')
      if ('donations' in mockApi && 'addToHistory' in (mockApi.donations as any)) {
        await (mockApi.donations as any).addToHistory({
          fund_id: item.fund_id,
          amount: { value: item.amount_value, currency: item.currency },
        })
      }
    }
  } catch (e) {
    console.warn('Could not add to demo history:', e)
  }
}

