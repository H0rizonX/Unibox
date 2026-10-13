import { apiClient } from './client'
import type { DashboardAnalytics, DashboardOverview } from './types'

export async function getOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>('/dashboard/overview')
  return data
}

export async function getAnalytics(): Promise<DashboardAnalytics> {
  const { data } = await apiClient.get<DashboardAnalytics>(
    '/dashboard/analytics'
  )
  return data
}
