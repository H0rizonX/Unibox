import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
// import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import * as authApi from '@/api/auth'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const EMAIL_RATE_LIMIT_SECONDS = 60

function getEmailRateLimitKey(email: string): string {
  return `email_rate_limit:${email.toLowerCase()}`
}

function getRemainingSeconds(email: string): number {
  const stored = localStorage.getItem(getEmailRateLimitKey(email))
  if (!stored) return 0

  const timestamp = parseInt(stored, 10)
  const remaining = timestamp + EMAIL_RATE_LIMIT_SECONDS * 1000 - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
}

function setEmailRateLimit(email: string): void {
  localStorage.setItem(getEmailRateLimitKey(email), Date.now().toString())
}

const formSchema = z
  .object({
    email: z.email({
      error: (iss) => (iss.input === '' ? '请输入邮箱。' : undefined),
    }),
    password: z
      .string()
      .min(1, '请输入密码。')
      .min(7, '密码至少需要 7 个字符。'),
    confirmPassword: z.string().min(1, '请确认密码。'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致。',
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const email = form.watch('email')

  useEffect(() => {
    if (countdown <= 0 || !email) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, email])

  useEffect(() => {
    if (email) {
      setCountdown(getRemainingSeconds(email))
    }
  }, [email])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (countdown > 0) return

    setIsLoading(true)

    try {
      const result = await authApi.signUp({
        email: data.email,
        password: data.password,
      })
      toast.success(result.message)
      if (result.otp) {
        toast.info(`开发环境验证码：${result.otp}`)
      }
      setEmailRateLimit(data.email)
      setCountdown(EMAIL_RATE_LIMIT_SECONDS)
      navigate({
        to: '/otp',
        search: { email: data.email, purpose: 'registration' },
      })
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading || countdown > 0}>
          {isLoading ? (
            <Loader2 className='animate-spin' />
          ) : countdown > 0 ? (
            `${countdown} 秒后可发送`
          ) : (
            <>
              <UserPlus /> 创建账户
            </>
          )}
        </Button>

        {/* <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              或使用以下方式继续
            </span>
          </div>
        </div> */}

        {/* <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div> */}
      </form>
    </Form>
  )
}
