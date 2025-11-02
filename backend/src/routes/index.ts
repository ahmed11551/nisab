import { Router } from 'express'
import { donationsRoutes } from './donations'
import { subscriptionsRoutes } from './subscriptions'
import { zakatRoutes } from './zakat'
import { fundsRoutes } from './funds'
import { partnersRoutes } from './partners'
import { campaignsRoutes } from './campaigns'
import { meRoutes } from './me'
import { adminRoutes } from './admin'
import { webhooksRoutes } from './webhooks'
import { telegramRoutes } from './telegram'
import { reportsRoutes } from './reports'

export const routes = Router()

routes.use('/donations', donationsRoutes)
routes.use('/subscriptions', subscriptionsRoutes)
routes.use('/zakat', zakatRoutes)
routes.use('/funds', fundsRoutes)
routes.use('/partners', partnersRoutes)
routes.use('/campaigns', campaignsRoutes)
routes.use('/me', meRoutes)
routes.use('/admin', adminRoutes)
routes.use('/payments/webhook', webhooksRoutes)
routes.use('/telegram', telegramRoutes)
routes.use('/reports', reportsRoutes)

