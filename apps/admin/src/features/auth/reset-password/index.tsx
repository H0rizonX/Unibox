import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

type ResetPasswordProps = {
  resetToken?: string
}

export function ResetPassword({ resetToken }: ResetPasswordProps) {
  return (
    <AuthLayout>
      <Card className="max-w-sm gap-4 sm:min-w-sm">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">设置新密码</CardTitle>
          <CardDescription>
            请输入您的新密码， <br /> 完成后即可使用新密码登录。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm resetToken={resetToken} />
        </CardContent>
        <CardFooter>
          <p className="mx-auto px-8 text-center text-sm text-balance text-muted-foreground">
            <Link
              to="/sign-in"
              className="underline underline-offset-4 hover:text-primary"
            >
              返回登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
