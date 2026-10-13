import { apiClient } from './client'

export type Role = {
  id: string
  name: string
  label: string
  description?: string
  permissions: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApiRole = {
  id: string
  name: string
  label: string
  description?: string
  permissions: string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

function parseRole(raw: ApiRole): Role {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export async function listRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<ApiRole[]>('/roles')
  return data.map(parseRole)
}

export async function getRole(id: string): Promise<Role> {
  const { data } = await apiClient.get<ApiRole>(`/roles/${id}`)
  return parseRole(data)
}

export async function createRole(body: {
  name: string
  label: string
  description?: string
  permissions: string[]
}): Promise<Role> {
  const { data } = await apiClient.post<ApiRole>('/roles', body)
  return parseRole(data)
}

export async function updateRole(
  id: string,
  body: Partial<{
    name: string
    label: string
    description: string
    permissions: string[]
  }>
): Promise<Role> {
  const { data } = await apiClient.patch<ApiRole>(`/roles/${id}`, body)
  return parseRole(data)
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`)
}

export const PERMISSION_OPTIONS = [
  { label: '仪表盘', value: 'menu:dashboard', group: '页面可见性' },
  { label: '用户管理', value: 'menu:users', group: '页面可见性' },
  { label: '任务管理', value: 'menu:tasks', group: '页面可见性' },
  { label: '设置', value: 'menu:settings', group: '页面可见性' },
  { label: '聊天', value: 'menu:chats', group: '页面可见性' },
  { label: '帮助中心', value: 'menu:help-center', group: '页面可见性' },
  { label: '查看用户', value: 'users:view', group: '用户操作' },
  { label: '创建用户', value: 'users:create', group: '用户操作' },
  { label: '编辑用户', value: 'users:edit', group: '用户操作' },
  { label: '删除用户', value: 'users:delete', group: '用户操作' },
  { label: '邀请用户', value: 'users:invite', group: '用户操作' },
  { label: '查看任务', value: 'tasks:view', group: '任务操作' },
  { label: '创建任务', value: 'tasks:create', group: '任务操作' },
  { label: '编辑任务', value: 'tasks:edit', group: '任务操作' },
  { label: '删除任务', value: 'tasks:delete', group: '任务操作' },
  { label: '导入任务', value: 'tasks:import', group: '任务操作' },
  { label: '查看设置', value: 'settings:view', group: '设置操作' },
  { label: '编辑设置', value: 'settings:edit', group: '设置操作' },
  { label: '查看角色', value: 'roles:view', group: '角色操作' },
  { label: '编辑角色', value: 'roles:edit', group: '角色操作' },
] as const
