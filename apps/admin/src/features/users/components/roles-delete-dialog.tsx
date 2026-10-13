'use client'

import * as rolesApi from '@/api/roles'
import { type Role } from '@/api/roles'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type RolesDeleteDialogProps = {
  currentRow: Role
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RolesDeleteDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: RolesDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      await rolesApi.deleteRole(currentRow.id)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      handleServerError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>删除角色</DialogTitle>
          <DialogDescription>
            确定要删除角色 <strong>{currentRow.label}</strong> 吗？
            此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button variant='destructive' onClick={handleDelete}>
            删除
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
