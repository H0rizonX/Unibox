import type { QueryClient } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { toast } from 'sonner'
import * as usersApi from '@/api/users'
import { handleServerError } from '@/lib/handle-server-error'
import type { User } from '../api/schema'

export type BulkUserStatus = 'active' | 'inactive' | 'suspended'

/**
 * 批量更改用户状态（普通工具函数，非hook）
 */
export async function changeBulkUserStatus<TData>(
  queryClient: QueryClient,
  table: Table<TData>,
  status: BulkUserStatus
): Promise<void> {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedUsers = selectedRows.map((row) => row.original as User)

  if (selectedUsers.length === 0) {
    toast.warning('请先选择要操作的用户。')
    return
  }

  try {
    await Promise.all(
      selectedUsers.map((user) => usersApi.updateUser(user.id, { status }))
    )
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    table.resetRowSelection()
    const statusLabel =
      status === 'active'
        ? '已激活'
        : status === 'inactive'
          ? '已停用'
          : '已拉黑'
    toast.success(`${statusLabel} ${selectedUsers.length} 个用户。`)
  } catch (error) {
    handleServerError(error)
  }
}
