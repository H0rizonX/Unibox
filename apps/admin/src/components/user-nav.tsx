import { Link } from '@tanstack/react-router'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

export function UserNav() {
  const accessToken = useAuthStore((state) => state.auth.accessToken)

  if (accessToken) {
    return <ProfileDropdown />
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/sign-in">登录</Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/sign-up">注册</Link>
      </Button>
    </div>
  )
}
