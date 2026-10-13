import { Router } from 'express'
import { asyncHandler } from '../middleware/error-handler.js'
import { authenticate } from '../middleware/auth.js'
import {
  getDashboardAnalytics,
  getDashboardOverview,
} from '../services/settings.service.js'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate)

dashboardRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const result = await getDashboardOverview()
    res.suc(result)
  })
)

dashboardRouter.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const result = await getDashboardAnalytics()
    res.suc(result)
  })
)
