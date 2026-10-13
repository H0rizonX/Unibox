import { apiClient } from './client'
import type { Account, Notifications, Profile } from './types'

export async function getProfile(): Promise<Profile> {
  const { data } = await apiClient.get<Profile>('/settings/profile')
  return data
}

export async function updateProfile(body: Profile): Promise<Profile> {
  const { data } = await apiClient.patch<Profile>('/settings/profile', body)
  return data
}

export async function getAccount(): Promise<Account> {
  const { data } = await apiClient.get<Account>('/settings/account')
  return data
}

export async function updateAccount(body: {
  name: string
  dob: Date
  language: string
}): Promise<Account> {
  const { data } = await apiClient.patch<Account>('/settings/account', body)
  return data
}

export async function getNotifications(): Promise<Notifications> {
  const { data } = await apiClient.get<Notifications>('/settings/notifications')
  return data
}

export async function updateNotifications(
  body: Notifications
): Promise<Notifications> {
  const { data } = await apiClient.patch<Notifications>(
    '/settings/notifications',
    body
  )
  return data
}
