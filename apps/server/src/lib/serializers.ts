import type { User } from '@prisma/client'

export type UserResponse = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

export type TaskResponse = {
  id: string
  title: string
  status: string
  label: string
  priority: string
  assignee?: string | null
  description?: string | null
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export function toTaskResponse(task: {
  id: string
  title: string
  status: string
  label: string
  priority: string
  assignee: string | null
  description: string | null
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    label: task.label,
    priority: task.priority,
    assignee: task.assignee,
    description: task.description,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}
