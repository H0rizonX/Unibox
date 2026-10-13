'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import * as rolesApi from '@/api/roles'
import { type Role } from '@/api/roles'
import { useAuthStore } from '@/stores/auth-store'
import { isAdmin as checkIsAdmin } from '@/lib/authorization'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { RolesDialog } from './roles-dialog'

type RolesListDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesListDialog({ open, onOpenChange }: RolesListDialogProps) {
  const queryClient = useQueryClient()
  const userRoles = useAuthStore((state) => state.auth.user?.role)
  // 使用普通 utils 函数替代 useAuthorization hook
  const isAdmin = checkIsAdmin(userRoles)

  const [editRole, setEditRole] = useState<Role | null>(null)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.listRoles,
    enabled: open,
  })

  const handleDeleteSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['roles'] })
    setDeleteRole(null)
    toast.success('角色已删除。')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader className='text-start'>
            <DialogTitle>角色管理</DialogTitle>
            <DialogDescription>
              在此管理系统的角色及其权限配置。系统角色不可编辑或删除。
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='max-h-[400px]'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <span className='text-muted-foreground'>加载中...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>角色名称</TableHead>
                    <TableHead>显示名称</TableHead>
                    <TableHead>权限数量</TableHead>
                    <TableHead>类型</TableHead>
                    {isAdmin && (
                      <TableHead className='text-end'>操作</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className='font-medium'>{role.name}</TableCell>
                      <TableCell>{role.label}</TableCell>
                      <TableCell>{role.permissions.length}</TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge variant='secondary'>系统角色</Badge>
                        ) : (
                          <Badge variant='outline'>自定义</Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className='text-end'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              disabled={role.isSystem || role.name === 'admin'}
                              onClick={() => {
                                setEditRole(role)
                                setEditDrawerOpen(true)
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              disabled={role.isSystem || role.name === 'admin'}
                              onClick={() => setDeleteRole(role)}
                            >
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
          {isAdmin && (
            <DialogFooter>
              <Button
                onClick={() => setShowCreateDrawer(true)}
                className='gap-1'
              >
                <Plus className='h-4 w-4' />
                新增角色
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <RolesDialog
        key='role-create'
        open={showCreateDrawer}
        onOpenChange={(state: boolean) => {
          setShowCreateDrawer(state)
          if (!state) {
            queryClient.invalidateQueries({ queryKey: ['roles'] })
          }
        }}
      />

      <RolesDialog
        key={`role-edit-${editRole?.id}`}
        currentRow={editRole || undefined}
        open={editDrawerOpen}
        onOpenChange={(state: boolean) => {
          setEditDrawerOpen(state)
          if (!state) {
            setTimeout(() => {
              setEditRole(null)
              queryClient.invalidateQueries({ queryKey: ['roles'] })
            }, 300)
          }
        }}
      />

      {deleteRole && (
        <RolesDeleteDialog
          key={`role-delete-${deleteRole.id}`}
          currentRow={deleteRole}
          open={!!deleteRole}
          onOpenChange={(state: boolean) => {
            if (!state) {
              setDeleteRole(null)
            }
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
