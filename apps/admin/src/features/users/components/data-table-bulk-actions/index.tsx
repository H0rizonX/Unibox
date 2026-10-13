import { useQueryClient } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { Ban, KeyRound, Trash2, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { isAdmin, isSuperAdminSelf } from '@/lib/authorization'
import { useAuthStore } from '@/stores/auth-store'
import { DEFAULT_RESET_PASSWORD, type User } from '../../api/schema'
import { changeBulkUserStatus } from '../../utils/bulk-actions'
import { bulkResetPassword } from '../../utils/user-actions'
import { UsersMultiDeleteDialog } from '../users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const authUser = useAuthStore((state) => state.auth.user)
  const userRoles = authUser?.role

  // 使用普通 utils 函数替代 useAuthorization hook
  if (!isAdmin(userRoles)) return null

  const getSelectedUsers = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original as User)

  const handleBulkResetConfirm = async () => {
    const users = getSelectedUsers()
    await bulkResetPassword(queryClient, users)
    setShowResetConfirm(false)
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName="用户">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                void changeBulkUserStatus(queryClient, table, 'active')
              }
              className="size-8"
              aria-label="激活所选用户"
              title="激活所选用户"
            >
              <UserCheck />
              <span className="sr-only">激活所选用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>激活所选用户</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                void changeBulkUserStatus(queryClient, table, 'inactive')
              }
              className="size-8"
              aria-label="停用所选用户"
              title="停用所选用户"
            >
              <UserX />
              <span className="sr-only">停用所选用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>停用所选用户</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                void changeBulkUserStatus(queryClient, table, 'suspended')
              }
              className="size-8"
              aria-label="拉黑所选用户"
              title="拉黑所选用户"
            >
              <Ban />
              <span className="sr-only">拉黑所选用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>拉黑所选用户（禁止登录）</p>
          </TooltipContent>
        </Tooltip>

        {/* 批量重置密码：按业务规则将所选用户密码统一重置为默认密码 User1234 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (getSelectedUsers().length === 0) {
                  toast.warning('请先选择要重置密码的用户。')
                  return
                }
                setShowResetConfirm(true)
              }}
              className="size-8 text-amber-600 hover:text-amber-700"
              aria-label="重置所选用户密码"
              title="重置所选用户密码"
            >
              <KeyRound />
              <span className="sr-only">重置所选用户密码</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>重置所选用户密码为默认密码</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                const selectedUsers = getSelectedUsers()
                if (selectedUsers.length === 0) {
                  toast.warning('请先选择要删除的用户。')
                  return
                }
                if (
                  selectedUsers.some((user) =>
                    isSuperAdminSelf(user.email, authUser)
                  )
                ) {
                  toast.error('超级管理员不能删除自己。')
                  return
                }
                setShowDeleteConfirm(true)
              }}
              className="size-8"
              aria-label="删除所选用户"
              title="删除所选用户"
            >
              <Trash2 />
              <span className="sr-only">删除所选用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选用户</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* 批量重置密码确认对话框 */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              确认批量重置密码
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p>
                即将重置{' '}
                <span className="font-semibold text-foreground">
                  {getSelectedUsers().length}
                </span>{' '}
                个用户的密码。
              </p>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                <p className="font-medium">⚠️ 业务规则说明</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <li>管理员无权自定义用户密码</li>
                  <li>
                    所有选中用户密码将统一重置为默认密码{' '}
                    <Badge variant="outline" className="font-mono">
                      {DEFAULT_RESET_PASSWORD}
                    </Badge>
                  </li>
                  <li>用户首次登录后需自行修改密码</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkResetConfirm}>
              确认重置 {getSelectedUsers().length} 个用户
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
