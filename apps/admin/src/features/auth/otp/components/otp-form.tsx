import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { handleServerError } from '@/lib/handle-server-error'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

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
  otp: z.string().min(6, '请输入 6 位验证码。').max(6, '请输入 6 位验证码。'),
})

export type OtpPurpose = 'registration' | 'password_reset'

type OtpFormProps = React.HTMLAttributes<HTMLFormElement> & {
  email?: string
  purpose?: OtpPurpose
}

export function OtpForm({
  className,
  email,
  purpose = 'password_reset',
  ...props
}: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(
    email ? getRemainingSeconds(email) : 0
  )
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const otp = form.watch('otp')

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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('缺少邮箱信息，请返回重新填写。')
      return
    }

    setIsLoading(true)

    try {
      if (purpose === 'registration') {
        const result = await authApi.verifyEmail({
          email,
          otp: data.otp,
        })
        auth.setAccessToken(result.accessToken)
        auth.setUser(result.user)
        toast.success('邮箱验证成功！')
        navigate({ to: '/', replace: true })
        return
      }

      const result = await authApi.verifyResetOtp({
        email,
        otp: data.otp,
      })
      toast.success(result.message)
      navigate({
        to: '/reset-password',
        search: { token: result.resetToken },
      })
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    if (!email || countdown > 0) {
      if (!email) {
        toast.error('缺少邮箱信息。')
      }
      return
    }

    setIsResending(true)
    try {
      const result =
        purpose === 'registration'
          ? await authApi.resendRegistrationOtp({ email })
          : await authApi.forgotPassword({ email })
      toast.success(result.message)
      if (result.otp) {
        toast.info(`开发环境验证码：${result.otp}`)
      }
      setEmailRateLimit(email)
      setCountdown(EMAIL_RATE_LIMIT_SECONDS)
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsResending(false)
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
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">验证码</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={otp.length < 6 || isLoading}>
          {purpose === 'registration' ? '验证邮箱' : '继续重置密码'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-sm"
          disabled={isResending || !email || countdown > 0}
          onClick={handleResend}
        >
          {isResending
            ? '发送中...'
            : countdown > 0
              ? `${countdown} 秒后重新发送`
              : '重新发送验证码'}
        </Button>
      </form>
    </Form>
  )
}
