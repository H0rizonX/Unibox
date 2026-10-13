import { useLocation, useNavigate } from '@tanstack/react-router'
import * as authApi from '@/api/auth'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await authApi.signOut()
    } catch {
      // 即使后端请求失败也清除本地会话
    }

    auth.reset()
    const currentPath = location.href
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="退出登录"
      desc="确定要退出登录吗？您需要重新登录才能访问您的账户。"
      confirmText="退出登录"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  )
}
