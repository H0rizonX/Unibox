import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Loader2, Lock, LogIn, User } from 'lucide-react'
import { toast } from 'sonner'
import * as authApi from '@/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? '请输入邮箱。' : undefined),
  }),
  password: z.string().min(1, '请输入密码。').min(7, '密码至少需要 7 个字符。'),
})

export type SignInInteractionState = {
  isTyping: boolean
  showPassword: boolean
  passwordLength: number
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  onInteractionChange?: (state: SignInInteractionState) => void
}

export function UserAuthForm({
  className,
  redirectTo,
  onInteractionChange,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const passwordValue = form.watch('password')

  function updateInteraction(patch: Partial<SignInInteractionState>) {
    const next: SignInInteractionState = {
      isTyping: patch.isTyping ?? isTyping,
      showPassword: patch.showPassword ?? showPassword,
      passwordLength: patch.passwordLength ?? passwordValue.length,
    }

    if (patch.isTyping !== undefined) {
      setIsTyping(patch.isTyping)
    }

    onInteractionChange?.(next)
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await authApi.signIn(data)
      auth.setAccessToken(result.accessToken)
      auth.setUser(result.user)

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      toast.success(`欢迎回来，${data.email}！`)
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
        className={cn('space-y-5', className)}
        autoComplete='off'
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <label className='mb-1.5 block text-sm font-medium'>邮箱</label>
              <FormControl>
                <div className='relative'>
                  <User className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='name@example.com'
                    className='h-12 ps-10'
                    {...field}
                    onFocus={() => updateInteraction({ isTyping: true })}
                    onBlur={() => updateInteraction({ isTyping: false })}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <label className='mb-1.5 block text-sm font-medium'>密码</label>
              <FormControl>
                <div className='relative'>
                  <Lock className='pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='********'
                    className='h-12 ps-10 pe-10'
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      updateInteraction({
                        passwordLength: event.target.value.length,
                      })
                    }}
                  />
                  <button
                    type='button'
                    className='absolute end-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground transition-colors hover:text-foreground'
                    onClick={() => {
                      setShowPassword((prev) => {
                        const next = !prev
                        updateInteraction({ showPassword: next })
                        return next
                      })
                    }}
                  >
                    {showPassword ? (
                      <Eye className='size-4' />
                    ) : (
                      <EyeOff className='size-4' />
                    )}
                    <span className='sr-only'>
                      {showPassword ? '隐藏密码' : '显示密码'}
                    </span>
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                忘记密码？
              </Link>
            </FormItem>
          )}
        />

        <Button type='submit' className='h-12 w-full' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='animate-spin' />
              正在登录...
            </>
          ) : (
            <>
              <LogIn />
              登录
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
