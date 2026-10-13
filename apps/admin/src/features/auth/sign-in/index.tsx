import { Link, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { Logo } from '@/assets/logo'
import { ThemeSwitch } from '@/components/theme-switch'
import { SignInBrandPanel } from './components/sign-in-brand-panel'
import {
  type SignInInteractionState,
  UserAuthForm,
} from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const [interaction, setInteraction] = useState<SignInInteractionState>({
    isTyping: false,
    showPassword: false,
    passwordLength: 0,
  })

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="absolute end-4 top-4 z-10">
        <ThemeSwitch />
      </div>

      <SignInBrandPanel
        isTyping={interaction.isTyping}
        showPassword={interaction.showPassword}
        passwordLength={interaction.passwordLength}
      />

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-12 flex items-center justify-center gap-2 lg:hidden">
            <Logo className="size-6" />
            <span className="text-lg font-bold">Shadcn 管理后台</span>
          </div>

          <div className="mb-10 text-center">
            <h1 className="mb-2.5 text-[26px] leading-tight font-bold tracking-tight">
              登录
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              在下方输入邮箱和密码以登录您的账户
            </p>
          </div>

          <UserAuthForm
            redirectTo={redirect}
            onInteractionChange={setInteraction}
          />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            还没有账户？{' '}
            <Link
              to="/sign-up"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
