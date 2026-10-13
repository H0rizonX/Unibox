import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as usersApi from '@/api/users'
import { handleServerError } from '@/lib/handle-server-error'
import type { User } from '../api/schema'

export type UserStatusChange = 'suspended' | 'active'

/**
 * 更改单个用户状态（普通工具函数，非hook）
 * 调用方需传入 queryClient 实例以刷新缓存
 */
export async function changeUserStatus(
  queryClient: QueryClient,
  user: User,
  status: UserStatusChange
): Promise<void> {
  try {
    await usersApi.updateUser(user.id, { status })
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success(
      status === 'suspended'
        ? `已拉黑用户 ${user.username}，该用户将无法登录。`
        : `已解封用户 ${user.username}。`
    )
  } catch (error) {
    handleServerError(error)
  }
}

/**
 * 重置单个用户密码为默认密码（普通工具函数，非hook）
 */
export async function resetPassword(
  queryClient: QueryClient,
  user: User
): Promise<{ message: string; defaultPassword: string } | null> {
  try {
    const result = await usersApi.resetUserPassword(user.id)
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success(`已重置用户 ${user.username} 的密码。`)
    return result
  } catch (error) {
    handleServerError(error)
    return null
  }
}

/**
 * 批量重置用户密码为默认密码（普通工具函数，非hook）
 */
export async function bulkResetPassword(
  queryClient: QueryClient,
  users: User[]
): Promise<void> {
  if (users.length === 0) {
    toast.warning('请先选择要重置密码的用户。')
    return
  }
  try {
    await Promise.all(users.map((u) => usersApi.resetUserPassword(u.id)))
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success(`已重置 ${users.length} 个用户的密码为默认密码。`)
  } catch (error) {
    handleServerError(error)
  }
}
