import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import type { Row } from '@tanstack/react-table'
import { Ban, KeyRound, ShieldCheck, Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isAdmin, isSuperAdminSelf } from '@/lib/authorization'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '../../api/schema'
import { changeUserStatus } from '../../utils/user-actions'
import { useUsers } from '../users-provider'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const queryClient = useQueryClient()
  const { setOpen, setCurrentRow } = useUsers()
  const authUser = useAuthStore((state) => state.auth.user)
  const userRoles = authUser?.role

  // 业务规则：仅管理员可见操作菜单（使用普通 utils 函数 isAdmin 替代 hook）
  if (!isAdmin(userRoles)) return null

  const isSuspended = row.original.status === 'suspended'
  const user = row.original
  const isSelfSuperAdmin = isSuperAdminSelf(user.email, authUser)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user)
            setOpen('edit')
          }}
        >
          编辑
          <DropdownMenuShortcut>
            <UserPen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 重置密码：管理员只能将密码重置为默认密码，无权自定义密码 */}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(user)
            setOpen('reset-password')
          }}
        >
          重置密码
          <DropdownMenuShortcut>
            <KeyRound size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => void changeUserStatus(queryClient, user, 'active')}
          disabled={!isSuspended}
        >
          解封
          <DropdownMenuShortcut>
            <ShieldCheck size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void changeUserStatus(queryClient, user, 'suspended')}
          disabled={isSuspended}
          className="text-orange-500!"
        >
          拉黑
          <DropdownMenuShortcut>
            <Ban size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {!isSelfSuperAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(user)
                setOpen('delete')
              }}
              className="text-red-500!"
            >
              删除
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
