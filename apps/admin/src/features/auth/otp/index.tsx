import { getRouteApi, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

const route = getRouteApi('/(auth)/otp')

export function Otp() {
  const { email, purpose = 'password_reset' } = route.useSearch()

  const isRegistration = purpose === 'registration'

  return (
    <AuthLayout>
      <Card className='max-w-md gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            {isRegistration ? '验证邮箱' : '重置密码'}
          </CardTitle>
          <CardDescription>
            请输入验证码。
            <br />
            我们已将验证码发送至您的邮箱{email ? `（${email}）` : ''}。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm email={email} purpose={purpose} />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            {isRegistration ? (
              <>
                已有账户？{' '}
                <Link
                  to='/sign-in'
                  className='underline underline-offset-4 hover:text-primary'
                >
                  登录
                </Link>
              </>
            ) : (
              <>
                想起密码了？{' '}
                <Link
                  to='/sign-in'
                  className='underline underline-offset-4 hover:text-primary'
                >
                  返回登录
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
