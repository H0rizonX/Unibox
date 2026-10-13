import { useState } from 'react'
import { RolesListDialog } from './roles-list-dialog'
import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers, type UsersDialogType } from './users-provider'
import { UsersResetPasswordDialog } from './users-reset-password-dialog'

/**
 * 关闭行绑定的对话框（edit / reset-password / delete）时：
 * 1. 立即将 open 置 null，避免两阶段对话框（如重置密码）在 onOpenChange 循环中被再次弹出
 * 2. 延迟 300ms 清空 currentRow，让 Dialog/AlertDialog 平滑完成关闭动画
 *
 * 额外支持：对两阶段对话框（reset-password），每打开一次就递增 resetPwdOpenCount，
 *           父级 React key 随之变化 → React 卸载旧实例重挂载 → 内部 state 天然干净。
 *           这比在子组件里 useEffect + setState 更符合 React 心智模型且没有性能告警。
 *
 * 注意：计数器必须使用 state 而不是 ref，原因有二：
 *   ① 渲染期间读取 ref.current 会触发 `react-hooks/refs` ESLint 错误
 *   ② ref 写入不会触发重渲染 → 父级 React key 变化后可能不会及时反映到 DOM
 */
function useCloseWithRowClear(
  setOpen: (dialog: UsersDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<unknown>>,
  bumpResetPwdCount: () => void
) {
  return (dialogType: UsersDialogType, nextOpen: boolean) => {
    if (nextOpen) {
      // 每次「打开」重置密码对话框，计数器自增 → 父组件重渲染 → key 变化 → 子组件重挂载
      if (dialogType === 'reset-password') {
        bumpResetPwdCount()
      }
      setOpen(dialogType)
    } else {
      // 关闭：立即取消 open，避免旧逻辑 setOpen(dialogType) 造成的"同时弹两个窗"
      setOpen(null)
      window.setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    }
  }
}

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  // 用 state 当强制重挂载计数器：每次打开 reset-password，setCount → 重渲染 → key 变化
  const [resetPwdOpenCount, setResetPwdOpenCount] = useState(0)
  const closeWithRowClear = useCloseWithRowClear(setOpen, setCurrentRow, () =>
    setResetPwdOpenCount((c) => c + 1)
  )

  return (
    <>
      {/* 无行上下文的全局对话框 —— 直接按 open/close 切换 */}
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(next) => setOpen(next ? 'add' : null)}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={(next) => setOpen(next ? 'invite' : null)}
      />

      <RolesListDialog
        key='roles-list'
        open={open === 'roles'}
        onOpenChange={(next) => setOpen(next ? 'roles' : null)}
      />

      {/* 行绑定对话框：关闭时统一走 closeWithRowClear 清理 currentRow */}
      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(next) => closeWithRowClear('edit', next)}
            currentRow={currentRow}
          />

          {/* key 加入序号：每打开一次就重挂载 → 内部 result/copied 状态永远干净，不用子组件 useEffect 反模式 */}
          <UsersResetPasswordDialog
            key={`user-reset-pwd-${currentRow.id}-${resetPwdOpenCount}`}
            open={open === 'reset-password'}
            onOpenChange={(next) => closeWithRowClear('reset-password', next)}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(next) => closeWithRowClear('delete', next)}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
