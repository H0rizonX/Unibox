import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type User, DEFAULT_RESET_PASSWORD } from '../api/schema'
import { resetPassword } from '../utils/user-actions'

type UsersResetPasswordDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 重置密码对话框（两阶段：确认 → 成功凭证展示）
 * 注意：内部状态（result / copied / isLoading）依赖父级 key 强制重挂载来重置，
 *       不要在这里用 useEffect 做 state 初始化（会触发 react-hooks/set-state-in-effect 告警）。
 *       父级 users-dialogs.tsx 通过 `resetPwdOpenCountRef` 保证每次打开都生成新 key。
 */
export function UsersResetPasswordDialog({
  currentRow,
  open,
  onOpenChange,
}: UsersResetPasswordDialogProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    message: string
    defaultPassword: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConfirm = async () => {
    if (!currentRow) return
    setIsLoading(true)
    try {
      const res = await resetPassword(queryClient, currentRow)
      if (res) {
        setResult(res)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setCopied(false)
    onOpenChange(false)
  }

  const handleCopyPassword = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.defaultPassword)
      setCopied(true)
      toast.success('默认密码已复制到剪贴板。')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败，请手动复制。')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        {!result ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2'>
                <KeyRound className='h-5 w-5 text-amber-500' />
                确认重置密码
              </AlertDialogTitle>
              <AlertDialogDescription className='space-y-2 pt-2'>
                <p>
                  即将重置用户{' '}
                  <span className='font-semibold text-foreground'>
                    {currentRow?.username}
                  </span>{' '}
                  的密码。
                </p>
                <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'>
                  <p className='font-medium'>⚠️ 业务规则说明</p>
                  <ul className='mt-1 list-disc space-y-0.5 pl-5'>
                    <li>管理员无权自定义用户密码</li>
                    <li>
                      密码将统一重置为默认密码{' '}
                      <Badge variant='outline' className='font-mono'>
                        {DEFAULT_RESET_PASSWORD}
                      </Badge>
                    </li>
                    <li>用户首次登录后需自行修改密码</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  void handleConfirm()
                }}
                disabled={isLoading}
              >
                {isLoading ? '重置中...' : '确认重置'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2 text-green-600 dark:text-green-500'>
                <Check className='h-5 w-5' />
                密码重置成功
              </AlertDialogTitle>
            </AlertDialogHeader>
            <Card className='border-green-200 dark:border-green-900'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  用户凭证
                </CardTitle>
                <CardDescription>请将以下信息安全地通知用户</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-3 items-center gap-3'>
                  <Label className='text-right text-muted-foreground'>
                    用户名
                  </Label>
                  <div className='col-span-2 font-medium'>
                    {currentRow?.username}
                  </div>
                </div>
                <div className='grid grid-cols-3 items-center gap-3'>
                  <Label className='text-right text-muted-foreground'>
                    邮箱
                  </Label>
                  <div className='col-span-2 font-medium'>
                    {currentRow?.email}
                  </div>
                </div>
                <div className='grid grid-cols-3 items-center gap-3'>
                  <Label className='text-right text-muted-foreground'>
                    临时密码
                  </Label>
                  <div className='col-span-2 flex items-center gap-2'>
                    <Input
                      readOnly
                      value={result.defaultPassword}
                      className='font-mono tracking-wider'
                    />
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      onClick={handleCopyPassword}
                      title='复制密码'
                    >
                      {copied ? (
                        <Check className='h-4 w-4 text-green-500' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
                <p className='rounded-md bg-muted p-2 text-xs text-muted-foreground'>
                  💡 建议用户首次使用默认密码登录后，立即在「设置 →
                  安全」中修改密码。
                </p>
              </CardContent>
            </Card>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleClose}>完成</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
