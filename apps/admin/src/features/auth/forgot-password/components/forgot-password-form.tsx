import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import * as authApi from '@/api/auth'
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
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'

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

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? '请输入邮箱。' : undefined),
  }),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
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
      const result = await authApi.forgotPassword(data)
      form.reset()
      setEmailRateLimit(data.email)
      setCountdown(EMAIL_RATE_LIMIT_SECONDS)
      navigate({
        to: '/otp',
        search: { email: data.email, purpose: 'password_reset' },
      })
      toast.success(result.message)
      if (result.otp) {
        toast.info(`开发环境验证码：${result.otp}`)
      }
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
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading || countdown > 0}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : countdown > 0 ? (
            `${countdown} 秒后可发送`
          ) : (
            <>
              继续 <ArrowRight />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
