'use client'

import { useQueryClient } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as usersApi from '@/api/users'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSuperAdminSelf } from '@/lib/authorization'
import { handleServerError } from '@/lib/handle-server-error'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '../data/schema'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = '删除'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const queryClient = useQueryClient()
  const authUser = useAuthStore((state) => state.auth.user)
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedUsers = selectedRows.map((row) => row.original as User)
  const includesSelfSuperAdmin = selectedUsers.some((user) =>
    isSuperAdminSelf(user.email, authUser)
  )

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入"${CONFIRM_WORD}"以确认。`)
      return
    }

    if (includesSelfSuperAdmin) {
      toast.error('超级管理员不能删除自己。')
      return
    }

    try {
      const ids = selectedUsers.map((user) => user.id)
      await usersApi.bulkDeleteUsers(ids)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      setValue('')
      table.resetRowSelection()
      onOpenChange(false)
      toast.success(`已删除 ${selectedRows.length} 个用户。`)
    } catch (error) {
      handleServerError(error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form="users-multi-delete-form"
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          删除 {selectedRows.length} 个用户
        </span>
      }
      desc={
        <form
          id="users-multi-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            void handleDelete()
          }}
          className="space-y-4"
        >
          <p className="mb-2">
            确定要删除所选用户吗？ <br />
            此操作无法撤销。
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">输入 "{CONFIRM_WORD}" 以确认：</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 以确认。`}
              autoFocus
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>请谨慎操作，此操作无法回滚。</AlertDescription>
          </Alert>
        </form>
      }
      confirmText="删除"
      destructive
    />
  )
}
