import type { User } from '@/features/users/data/schema'
import { apiClient } from './client'
import type { ApiUser, PaginatedResult } from './types'

export type ListUsersParams = {
  page?: number
  pageSize?: number
  username?: string
  status?: string[]
  role?: string[]
}

export function parseUser(raw: ApiUser): User {
  return {
    ...raw,
    status: raw.status as User['status'],
    role: raw.role as User['role'],
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

function buildListParams(params: ListUsersParams) {
  return {
    page: params.page,
    pageSize: params.pageSize,
    username: params.username || undefined,
    status: params.status?.length ? params.status.join(',') : undefined,
    role: params.role?.length ? params.role.join(',') : undefined,
  }
}

export async function listUsers(
  params: ListUsersParams = {}
): Promise<PaginatedResult<User>> {
  const { data } = await apiClient.get<PaginatedResult<ApiUser>>('/users', {
    params: buildListParams(params),
  })
  return {
    data: data.data.map(parseUser),
    meta: data.meta,
  }
}

export async function createUser(body: {
  firstName: string
  lastName: string
  username: string
  phoneNumber: string
  email: string
  password: string
  role: string
  status?: string
}): Promise<User> {
  const { data } = await apiClient.post<ApiUser>('/users', body)
  return parseUser(data)
}

/**
 * 更新用户信息（不含密码）
 * 业务规则：管理员无法通过此接口修改用户密码
 * 如需重置密码，请使用 resetUserPassword 接口
 */
export async function updateUser(
  id: string,
  body: Partial<{
    firstName: string
    lastName: string
    username: string
    phoneNumber: string
    email: string
    role: string
    status: string
  }>
): Promise<User> {
  const { data } = await apiClient.patch<ApiUser>(`/users/${id}`, body)
  return parseUser(data)
}

/**
 * 管理员重置用户密码为系统默认密码 (User1234)
 * 业务规则：管理员无法自定义用户密码，只能统一重置为默认密码
 * 用户首次登录后需自行修改密码
 */
export async function resetUserPassword(
  id: string
): Promise<{ message: string; defaultPassword: string }> {
  const { data } = await apiClient.post<{
    message: string
    defaultPassword: string
  }>(`/users/${id}/reset-password`)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}

export async function bulkDeleteUsers(
  ids: string[]
): Promise<{ deleted: number }> {
  const { data } = await apiClient.delete<{ deleted: number }>('/users/bulk', {
    data: { ids },
  })
  return data
}

export async function inviteUser(body: {
  email: string
  role: string
  desc?: string
}): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    '/users/invite',
    body
  )
  return data
}
