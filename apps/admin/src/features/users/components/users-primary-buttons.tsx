import { MailPlus, UserPlus, User2Icon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { isAdmin as checkIsAdmin } from '@/lib/authorization'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const userRoles = useAuthStore((state) => state.auth.user?.role)
  // 使用普通 utils 函数替代 useAuthorization hook
  if (!checkIsAdmin(userRoles)) return null

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('roles')}
      >
        <span>角色管理</span> <User2Icon size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>邀请用户</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>添加用户</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
