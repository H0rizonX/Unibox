import type { Prisma } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { prisma } from '../lib/prisma.js'
import { badRequest, notFound } from '../lib/errors.js'
import {
  buildMeta,
  parseArrayParam,
  parsePagination,
} from '../lib/pagination.js'
import { toTaskResponse } from '../lib/serializers.js'
import type {
  createTaskSchema,
  updateTaskSchema,
} from '../validators/schemas.js'
import type { z } from 'zod'

type ListTasksQuery = {
  page?: unknown
  pageSize?: unknown
  filter?: unknown
  status?: unknown
  priority?: unknown
}

async function generateTaskId(): Promise<string> {
  const count = await prisma.task.count()
  return `TASK-${1000 + count + 1}`
}

export async function listTasks(query: ListTasksQuery) {
  const { page, pageSize, skip, take } = parsePagination(query)
  const statuses = parseArrayParam(query.status)
  const priorities = parseArrayParam(query.priority)
  const filter = query.filter ? String(query.filter).toLowerCase() : ''

  const where: Prisma.TaskWhereInput = {
    ...(statuses.length ? { status: { in: statuses } } : {}),
    ...(priorities.length ? { priority: { in: priorities } } : {}),
    ...(filter
      ? {
          OR: [{ id: { contains: filter } }, { title: { contains: filter } }],
        }
      : {}),
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    data: tasks.map(toTaskResponse),
    meta: buildMeta(page, pageSize, total),
  }
}

export async function getAllTasks() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  return tasks.map(toTaskResponse)
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw notFound('任务不存在。')
  return toTaskResponse(task)
}

export async function createTask(input: z.infer<typeof createTaskSchema>) {
  const id = await generateTaskId()
  const task = await prisma.task.create({
    data: {
      id,
      title: input.title,
      status: input.status,
      label: input.label,
      priority: input.priority,
      assignee: input.assignee,
      description: input.description,
      dueDate: input.dueDate,
    },
  })
  return toTaskResponse(task)
}

export async function updateTask(
  id: string,
  input: z.infer<typeof updateTaskSchema>
) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw notFound('任务不存在。')

  const updated = await prisma.task.update({ where: { id }, data: input })
  return toTaskResponse(updated)
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw notFound('任务不存在。')
  await prisma.task.delete({ where: { id } })
}

export async function bulkDeleteTasks(ids: string[]) {
  if (!ids.length) throw badRequest('请选择至少一个任务。')
  const result = await prisma.task.deleteMany({ where: { id: { in: ids } } })
  return { deleted: result.count }
}

export async function importTasksFromCsv(buffer: Buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[]

  if (!records.length) {
    throw badRequest('CSV 文件为空或格式无效。')
  }

  const created = []
  for (const row of records) {
    const title = row.title ?? row.Title
    if (!title) continue

    const id = row.id ?? (await generateTaskId())
    const existing = await prisma.task.findUnique({ where: { id } })
    if (existing) continue

    const task = await prisma.task.create({
      data: {
        id,
        title,
        status: row.status ?? 'todo',
        label: row.label ?? 'feature',
        priority: row.priority ?? 'medium',
        assignee: row.assignee,
        description: row.description,
      },
    })
    created.push(toTaskResponse(task))
  }

  return { imported: created.length, data: created }
}
