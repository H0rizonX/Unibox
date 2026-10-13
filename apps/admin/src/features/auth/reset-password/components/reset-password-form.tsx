import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as authApi from '@/api/auth'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'

const formSchema = z
  .object({
    password: z
      .string()
      .min(1, '请输入新密码。')
      .min(7, '密码至少需要 7 个字符。'),
    confirmPassword: z.string().min(1, '请确认密码。'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致。',
    path: ['confirmPassword'],
  })

type ResetPasswordFormProps = React.HTMLAttributes<HTMLFormElement> & {
  resetToken?: string
}

export function ResetPasswordForm({
  className,
  resetToken,
  ...props
}: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!resetToken) {
      toast.error('重置链接无效或已过期，请重新申请。')
      return
    }

    setIsLoading(true)

    try {
      const result = await authApi.resetPassword({
        resetToken,
        password: data.password,
      })
      toast.success(result.message)
      navigate({ to: '/sign-in', replace: true })
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认新密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading || !resetToken}>
          {isLoading ? <Loader2 className="animate-spin" /> : <KeyRound />}
          重置密码
        </Button>
      </form>
    </Form>
  )
}
