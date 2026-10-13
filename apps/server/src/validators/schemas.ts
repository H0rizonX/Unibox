import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  password: z.string().min(1, '请输入密码。'),
})

export const signUpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  password: z.string().min(7, '密码至少需要 7 个字符。'),
})

export const verifyEmailSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  otp: z.string().length(6, '请输入 6 位验证码。'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
})

export const verifyResetOtpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  otp: z.string().length(6, '请输入 6 位验证码。'),
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, '重置令牌无效。'),
  password: z.string().min(7, '密码至少需要 7 个字符。'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码。'),
  newPassword: z.string().min(7, '新密码至少需要 7 个字符。'),
})

/** @deprecated Use verifyEmailSchema or verifyResetOtpSchema */
export const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  otp: z.string().length(6, '请输入 6 位验证码。'),
})

export const createUserSchema = z.object({
  firstName: z.string().min(1, '名字不能为空。'),
  lastName: z.string().min(1, '姓氏不能为空。'),
  username: z.string().min(1, '用户名不能为空。'),
  phoneNumber: z.string().min(1, '电话号码不能为空。'),
  email: z.string().email('请输入有效的邮箱地址。'),
  password: z
    .string()
    .min(8, '密码至少需要 8 个字符。')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母。')
    .regex(/\d/, '密码必须包含至少一个数字。'),
  role: z.enum(['superadmin', 'admin', 'tenant', 'user']),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['superadmin', 'admin', 'tenant', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const inviteUserSchema = z.object({
  email: z.string().email('请输入要邀请的邮箱。'),
  role: z.enum(['superadmin', 'admin', 'tenant', 'user']),
  desc: z.string().optional(),
})

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, '请选择至少一项。'),
})

export const createTaskSchema = z.object({
  title: z.string().min(1, '标题不能为空。'),
  status: z.enum(['todo', 'in progress', 'done', 'canceled', 'backlog']),
  label: z.enum(['bug', 'feature', 'documentation']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()

export const profileSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  bio: z.string().max(160).min(4),
  urls: z.array(z.object({ value: z.string().url() })).optional(),
})

export const accountSchema = z.object({
  name: z.string().min(2).max(30),
  dob: z.coerce.date(),
  language: z.string().min(1),
})

export const notificationsSchema = z.object({
  type: z.enum(['all', 'mentions', 'none']),
  mobile: z.boolean().optional(),
  communication_emails: z.boolean().optional(),
  social_emails: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  security_emails: z.boolean(),
})

export const sendMessageSchema = z.object({
  message: z.string().min(1, '消息不能为空。'),
})

export const createConversationSchema = z.object({
  fullName: z.string().min(1),
  username: z.string().min(1),
  title: z.string().optional(),
  message: z.string().min(1),
})

export const createRoleSchema = z.object({
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

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, '角色名称不能为空。')
    .max(50, '角色名称不能超过50个字符。')
    .refine((val) => val !== 'superadmin', '禁止修改为超级管理员角色。')
    .optional(),
  label: z
    .string()
    .min(1, '角色显示名称不能为空。')
    .max(50, '角色显示名称不能超过50个字符。')
    .optional(),
  description: z.string().max(200, '描述不能超过200个字符。').optional(),
  permissions: z.array(z.string()).min(1, '请至少选择一个权限。').optional(),
})
