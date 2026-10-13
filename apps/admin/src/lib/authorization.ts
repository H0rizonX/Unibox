import { useAuthStore } from '@/stores/auth-store'

/** 系统角色定义 */
export type SystemRole = 'superadmin' | 'admin' | 'tenant' | 'user'

/** 拥有管理权限的角色 */
export const ADMIN_ROLES: SystemRole[] = ['superadmin', 'admin']

/**
 * 判断当前用户的角色列表是否包含任一目标角色
 * @param userRoles - 用户拥有的角色列表（来自 authStore）
 * @param required  - 需要满足的角色（满足任意一个即返回 true）
 */
export function hasRole(
  userRoles: string[] | undefined | null,
  required: SystemRole[]
): boolean {
  if (!userRoles || userRoles.length === 0) return false
  return userRoles.some((r) => required.includes(r as SystemRole))
}

/** 判断是否为管理员（superadmin 或 admin） */
export function isAdmin(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ADMIN_ROLES)
}

/** 判断是否为超级管理员 */
export function isSuperAdmin(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ['superadmin'])
}

/** 超级管理员不能删除自己的账号 */
export function isSuperAdminSelf(
  targetEmail: string,
  currentUser: { email: string; role: string[] } | null | undefined
): boolean {
  if (!currentUser) return false
  return targetEmail === currentUser.email && isSuperAdmin(currentUser.role)
}

/**
 * React Hook：获取当前用户的授权信息
 *
 * @example
 *   const { isAdmin, hasRole } = useAuthorization()
 *   if (isAdmin) return <AdminButton />
 */
export function useAuthorization() {
  const roles = useAuthStore((state) => state.auth.user?.role)
  return {
    roles: roles ?? [],
    isAdmin: isAdmin(roles),
    hasRole: (required: SystemRole[]) => hasRole(roles, required),
  }
}
