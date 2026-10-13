import { Logo } from '@/assets/logo'
import { AnimatedCharacters } from './animated-characters'

type SignInBrandPanelProps = {
  isTyping?: boolean
  showPassword?: boolean
  passwordLength?: number
}

export function SignInBrandPanel({
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
}: SignInBrandPanelProps) {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/70 p-12 text-primary-foreground lg:flex">
      <div className="relative z-20 flex items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-primary-foreground/20 bg-primary-foreground/12 backdrop-blur-sm">
          <Logo className="size-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-wide">Shadcn 管理后台</span>
      </div>

      <div className="relative z-20 flex h-[500px] items-end justify-center">
        <AnimatedCharacters
          isTyping={isTyping}
          showPassword={showPassword}
          passwordLength={passwordLength}
        />
      </div>

      <div className="relative z-20 flex items-center gap-6">
        <a
          href="#"
          className="text-[13px] text-primary-foreground/45 no-underline transition-colors hover:text-primary-foreground/85"
        >
          帮助中心
        </a>
        <a
          href="#"
          className="text-[13px] text-primary-foreground/45 no-underline transition-colors hover:text-primary-foreground/85"
        >
          隐私政策
        </a>
      </div>

      <div
        className="pointer-events-none absolute end-[10%] top-[15%] z-0 size-[300px] rounded-full bg-primary-foreground/10 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute start-[5%] bottom-[10%] z-0 size-[400px] rounded-full bg-primary-foreground/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(var(--primary-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--primary-foreground)_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.03]"
        aria-hidden
      />
    </div>
  )
}
