import { Shield, User, UserCheck, Users } from 'lucide-react'
import type { UserStatus } from './schema'

export const statuses = [
  { label: '活跃', value: 'active' },
  { label: '未活跃', value: 'inactive' },
  { label: '禁止登录', value: 'suspended' },
] as const satisfies ReadonlyArray<{ label: string; value: UserStatus }>

export const statusLabels = new Map<UserStatus, string>(
  statuses.map(({ value, label }) => [value, label])
)

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: '超级管理员',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: '管理员',
    value: 'admin',
    icon: UserCheck,
  },
  {
    label: '租户',
    value: 'tenant',
    icon: Users,
  },
  {
    label: '用户',
    value: 'user',
    icon: User,
  },
] as const

export function getRoleLabel(role: string) {
  return roles.find(({ value }) => value === role)?.label ?? role
}
