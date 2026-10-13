'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as usersApi from '@/api/users'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { handleServerError } from '@/lib/handle-server-error'
import { DEFAULT_RESET_PASSWORD, type User } from '../api/schema'
import { roles } from '../data/data'

/**
 * 新增用户表单校验（必须设置密码）
 */
const createFormSchema = z
  .object({
    firstName: z.string().min(1, '名字不能为空。'),
    lastName: z.string().min(1, '姓氏不能为空。'),
    username: z.string().min(1, '用户名不能为空。'),
    phoneNumber: z.string().min(1, '电话号码不能为空。'),
    email: z.email({
      error: (iss) => (iss.input === '' ? '邮箱不能为空。' : undefined),
    }),
    password: z
      .string()
      .min(8, '密码至少需要 8 个字符。')
      .regex(/[a-z]/, '密码必须包含至少一个小写字母。')
      .regex(/\d/, '密码必须包含至少一个数字。'),
    role: z.string().min(1, '请选择角色。'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致。',
    path: ['confirmPassword'],
  })

/**
 * 编辑用户表单校验（不包含密码字段 - 业务规则：管理员只能重置默认密码，不能修改密码）
 */
const updateFormSchema = z.object({
  firstName: z.string().min(1, '名字不能为空。'),
  lastName: z.string().min(1, '姓氏不能为空。'),
  username: z.string().min(1, '用户名不能为空。'),
  phoneNumber: z.string().min(1, '电话号码不能为空。'),
  email: z.email({
    error: (iss) => (iss.input === '' ? '邮箱不能为空。' : undefined),
  }),
  role: z.string().min(1, '请选择角色。'),
})

type CreateUserForm = z.infer<typeof createFormSchema>
type UpdateUserForm = z.infer<typeof updateFormSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!currentRow

  // 根据新增/编辑模式选择不同的 schema
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      role: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const updateForm = useForm<UpdateUserForm>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.firstName,
          lastName: currentRow.lastName,
          username: currentRow.username,
          email: currentRow.email,
          phoneNumber: currentRow.phoneNumber,
          role: currentRow.role,
        }
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          phoneNumber: '',
          role: '',
        },
  })

  const form = isEdit ? updateForm : createForm

  const onCreateSubmit = async (values: CreateUserForm) => {
    try {
      const { confirmPassword: _, ...payload } = values
      await usersApi.createUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      })
      toast.success('用户已创建。')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      createForm.reset()
      onOpenChange(false)
    } catch (error) {
      handleServerError(error)
    }
  }

  const onUpdateSubmit = async (values: UpdateUserForm) => {
    if (!currentRow) return
    try {
      await usersApi.updateUser(currentRow.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        phoneNumber: values.phoneNumber,
        email: values.email,
        role: values.role,
      })
      toast.success('用户已更新。')
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      updateForm.reset()
      onOpenChange(false)
    } catch (error) {
      handleServerError(error)
    }
  }

  const onSubmit = isEdit
    ? updateForm.handleSubmit(onUpdateSubmit)
    : createForm.handleSubmit(onCreateSubmit)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? '编辑用户' : '添加用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <>
                <span>在此更新用户基本信息。</span>
                <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                  ℹ️
                  管理员无法直接修改用户密码。如需重置密码，请关闭此窗口后在操作菜单中选择「重置密码」，密码将统一重置为默认密码{' '}
                  <Badge variant="outline" className="font-mono">
                    {DEFAULT_RESET_PASSWORD}
                  </Badge>
                </div>
              </>
            ) : (
              <>
                在此创建新用户。创建时需设置初始密码，用户登录后可自行修改。完成后点击保存。
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={onSubmit}
              className="space-y-4 px-0.5"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">名字</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">姓氏</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="col-span-4"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      用户名
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john_doe"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe@gmail.com"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">
                      电话号码
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+123456789"
                        className="col-span-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                    <FormLabel className="col-span-2 text-end">角色</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="选择角色"
                      className="col-span-4"
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* 仅新增用户时显示密码输入 - 编辑时按业务规则不允许修改密码 */}
              {!isEdit && (
                <>
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          初始密码
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="e.g., S3cur3P@ssw0rd"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                        <FormLabel className="col-span-2 text-end">
                          确认密码
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="e.g., S3cur3P@ssw0rd"
                            className="col-span-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="col-span-4 col-start-3" />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="user-form">
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
