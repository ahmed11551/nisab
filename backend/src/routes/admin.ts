import { Router } from 'express'
import { adminController } from '../controllers/admin'

export const adminRoutes = Router()

// Admin routes - implement admin auth middleware
adminRoutes.get('/partners/applications', adminController.getApplications)
adminRoutes.patch('/partners/applications/:id', adminController.updateApplication)
adminRoutes.patch('/funds/:id', adminController.updateFund)
adminRoutes.patch('/campaigns/:id/status', adminController.updateCampaignStatus)

