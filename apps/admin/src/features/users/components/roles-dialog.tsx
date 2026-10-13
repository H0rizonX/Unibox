'use client'

import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as rolesApi from '@/api/roles'
import { type Role } from '@/api/roles'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const roleFormSchema = z.object({
  name: z
    .string()
    .min(1, '角色名称不能为空。')
    .max(50, '角色名称不能超过50个字符。')
    .refine((val) => val !== 'superadmin', '禁止创建超级管理员角色。'),
  label: z
    .string()
    .min(1, '角色显示名称不能为空。')
    .max(50, '角色显示名称不能超过50个字符。'),
  description: z.string().max(200, '描述不能超过200个字符。').optional(),
  permissions: z.array(z.string()).min(1, '请至少选择一个权限。'),
})

type RoleForm = z.infer<typeof roleFormSchema>

type RolesDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesDialog({
  currentRow,
  open,
  onOpenChange,
}: RolesDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!currentRow
  const isSystemRole = currentRow?.isSystem ?? false

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, { label: string; value: string }[]> = {}
    for (const perm of rolesApi.PERMISSION_OPTIONS) {
      if (!groups[perm.group]) {
        groups[perm.group] = []
      }
      groups[perm.group].push({ label: perm.label, value: perm.value })
    }
    return groups
  }, [])

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          label: currentRow.label,
          description: currentRow.description ?? '',
          permissions: currentRow.permissions,
        }
      : {
          name: '',
          label: '',
          description: '',
          permissions: [],
        },
  })

  // 当 currentRow 或 open 状态变化时重置表单
  useEffect(() => {
    if (open) {
      form.reset(
        isEdit
          ? {
              name: currentRow.name,
              label: currentRow.label,
              description: currentRow.description ?? '',
              permissions: currentRow.permissions,
            }
          : {
              name: '',
              label: '',
              description: '',
              permissions: [],
            }
      )
    }
  }, [open, currentRow, isEdit, form])

  const onSubmit = async (values: RoleForm) => {
    try {
      if (isEdit && currentRow) {
        await rolesApi.updateRole(currentRow.id, {
          name: values.name,
          label: values.label,
          description: values.description,
          permissions: values.permissions,
        })
        toast.success('角色已更新。')
      } else {
        await rolesApi.createRole({
          name: values.name,
          label: values.label,
          description: values.description,
          permissions: values.permissions,
        })
        toast.success('角色已创建。')
      }
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      handleServerError(error)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        if (!state) form.reset()
        onOpenChange(state)
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>{isEdit ? '编辑角色' : '新增角色'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '在此更新角色信息。' : '在此创建新角色并配置权限。'}
            完成后点击保存。
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='role-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {isSystemRole && (
              <div className='rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
                系统角色（superadmin、admin）不可编辑。
              </div>
            )}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='例如：editor'
                      disabled={isSystemRole}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='例如：编辑者'
                      disabled={isSystemRole}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='角色用途说明'
                      disabled={isSystemRole}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name='permissions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>权限配置</FormLabel>
                  <div className='space-y-4 rounded-md border p-4'>
                    {Object.entries(groupedPermissions).map(
                      ([group, perms]) => (
                        <div key={group}>
                          <h4 className='mb-3 text-sm font-medium text-muted-foreground'>
                            {group}
                          </h4>
                          <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                            {perms.map((perm) => (
                              <label
                                key={perm.value}
                                className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted'
                              >
                                <Checkbox
                                  checked={field.value.includes(perm.value)}
                                  disabled={isSystemRole}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        perm.value,
                                      ])
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (v) => v !== perm.value
                                        )
                                      )
                                    }
                                  }}
                                />
                                <span className='text-sm'>{perm.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button type='submit' form='role-form' disabled={isSystemRole}>
            保存更改
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
