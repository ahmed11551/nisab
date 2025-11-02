import { useState } from 'react'
import { useQuery } from 'react-query'
import { historyApi, reportsApi } from '../services/api'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import './HistoryPage.css'

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'reports'>('history')
  const [filters, setFilters] = useState({
    type: '' as 'donation' | 'subscription' | 'zakat' | '',
    period: '',
    from: '',
    to: '',
  })

  const { data: history, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useQuery(
    ['history', filters],
    () =>
      historyApi
        .get({
          type: filters.type || undefined,
          period: filters.period || undefined,
        })
        .then((res) => res.data),
    {
      enabled: activeTab === 'history',
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        console.error('Failed to load history:', err)
      },
    }
  )

  const { data: reports, isLoading: reportsLoading, error: reportsError, refetch: refetchReports } = useQuery(
    'fund-reports',
    () => reportsApi.getFundReports().then((res) => res.data),
    {
      enabled: activeTab === 'reports',
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        console.error('Failed to load reports:', err)
      },
    }
  )

  return (
    <div className="history-page">
      <h1>История и отчёты</h1>

      {/* Tabs */}
      <div className="history-tabs">
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          История транзакций
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Отчёты фондов
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <div className="history-filters">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="filter-select"
            >
              <option value="">Все типы</option>
              <option value="donation">Пожертвование</option>
              <option value="subscription">Подписка</option>
              <option value="zakat">Закят</option>
              <option value="campaign">Кампания</option>
            </select>

            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="filter-select"
            >
              <option value="">Весь период</option>
              <option value="month">Этот месяц</option>
              <option value="quarter">Этот квартал</option>
              <option value="year">Этот год</option>
            </select>
          </div>

          {/* History List */}
          {historyLoading ? (
            <Loading message="Загрузка истории..." />
          ) : historyError ? (
            <ErrorMessage
              title="Ошибка загрузки истории"
              message={historyError instanceof Error ? historyError.message : 'Не удалось загрузить историю транзакций'}
              onRetry={() => refetchHistory()}
            />
          ) : !history?.items || history.items.length === 0 ? (
            <EmptyState
              icon="📜"
              title="История пуста"
              description="У вас пока нет транзакций. Сделайте первое пожертвование!"
            />
          ) : (
            <div className="history-list">
              {history.items.map((item: any) => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <div>
                        <h3>
                          {item.type === 'donation' && '💰 Пожертвование'}
                          {item.type === 'subscription' && '📅 Подписка'}
                          {item.type === 'zakat' && '📊 Закят'}
                        </h3>
                        <p className="history-description">
                          {item.fund?.name || item.purpose || 'Без описания'}
                        </p>
                      </div>
                      <span className={`history-amount ${item.status}`}>
                        {item.amount_value || item.amount || 0} {item.currency || 'RUB'}
                      </span>
                    </div>
                    <div className="history-item-details">
                      <span className="history-date">
                        {new Date(item.created_at || item.paid_at).toLocaleDateString('ru-RU')}
                      </span>
                      <span className={`history-status ${item.status}`}>
                        {item.status === 'paid' && '✅ Оплачено'}
                        {item.status === 'active' && '🟢 Активно'}
                        {item.status === 'created' && '⏳ Ожидает оплаты'}
                        {item.status === 'failed' && '❌ Ошибка'}
                      </span>
                      {item.receipt_url && (
                        <a
                          href={item.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="receipt-link"
                        >
                          📄 Чек
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {reportsLoading ? (
            <Loading message="Загрузка отчётов..." />
          ) : reportsError ? (
            <ErrorMessage
              title="Ошибка загрузки отчётов"
              message={reportsError instanceof Error ? reportsError.message : 'Не удалось загрузить отчёты фондов'}
              onRetry={() => refetchReports()}
            />
          ) : !reports?.items || reports.items.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Отчёты недоступны"
              description="В данный момент нет доступных отчётов фондов"
            />
          ) : (
            <div className="reports-list">
              {reports.items.map((report: any) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.fund?.name || 'Фонд'}</h3>
                      {report.verified && <span className="verified-badge">✓ Проверено</span>}
                    </div>
                    <div className="report-period">
                      <span>
                        {new Date(report.period_start).toLocaleDateString('ru-RU')} -{' '}
                        {new Date(report.period_end).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="report-stats">
                      <div className="stat-item">
                        <span className="stat-label">Собрано:</span>
                        <span className="stat-value">{report.total_collected?.toLocaleString() || 0} ₽</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Перечислено:</span>
                        <span className="stat-value">{report.total_distributed?.toLocaleString() || 0} ₽</span>
                      </div>
                    </div>
                    {report.file_url && (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="report-link"
                      >
                        📄 Посмотреть отчёт
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HistoryPage
