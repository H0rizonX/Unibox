import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { User } from '../api/schema'

/**
 * 用户管理支持的对话框类型
 * invite: 邀请用户
 * add: 新增用户（含密码）
 * edit: 编辑用户（不含密码，密码只能通过 reset-password 重置）
 * delete: 删除用户
 * roles: 角色列表
 * reset-password: 重置用户密码为默认密码 (User1234)
 */
export type UsersDialogType =
  | 'invite'
  | 'add'
  | 'edit'
  | 'delete'
  | 'roles'
  | 'reset-password'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
