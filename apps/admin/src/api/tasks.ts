import type { Task } from '@/features/tasks/data/schema'
import { apiClient } from './client'
import type { ApiTask, PaginatedResult } from './types'

export type ListTasksParams = {
  page?: number
  pageSize?: number
  filter?: string
  status?: string[]
  priority?: string[]
}

function parseTask(raw: ApiTask): Task {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.status,
    label: raw.label,
    priority: raw.priority,
  }
}

function buildListParams(params: ListTasksParams) {
  return {
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || undefined,
    status: params.status?.length ? params.status.join(',') : undefined,
    priority: params.priority?.length ? params.priority.join(',') : undefined,
  }
}

export async function listTasks(
  params: ListTasksParams = {}
): Promise<PaginatedResult<Task>> {
  const { data } = await apiClient.get<PaginatedResult<ApiTask>>('/tasks', {
    params: buildListParams(params),
  })
  return {
    data: data.data.map(parseTask),
    meta: data.meta,
  }
}

export async function createTask(body: {
  title: string
  status: string
  label: string
  priority: string
}): Promise<Task> {
  const { data } = await apiClient.post<ApiTask>('/tasks', body)
  return parseTask(data)
}

export async function updateTask(
  id: string,
  body: Partial<{
    title: string
    status: string
    label: string
    priority: string
  }>
): Promise<Task> {
  const { data } = await apiClient.patch<ApiTask>(`/tasks/${id}`, body)
  return parseTask(data)
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}

export async function bulkDeleteTasks(
  ids: string[]
): Promise<{ deleted: number }> {
  const { data } = await apiClient.delete<{ deleted: number }>('/tasks/bulk', {
    data: { ids },
  })
  return data
}

export async function importTasks(
  file: File
): Promise<{ imported: number; data: ApiTask[] }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post<{ imported: number; data: ApiTask[] }>(
    '/tasks/import',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}
