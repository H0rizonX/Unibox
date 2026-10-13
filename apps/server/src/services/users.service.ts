import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js'
import {
  buildMeta,
  parseArrayParam,
  parsePagination,
} from '../lib/pagination.js'
import { toUserResponse } from '../lib/serializers.js'
import type {
  createUserSchema,
  inviteUserSchema,
  updateUserSchema,
} from '../validators/schemas.js'
import type { z } from 'zod'

type ListUsersQuery = {
  page?: unknown
  pageSize?: unknown
  username?: unknown
  status?: unknown
  role?: unknown
}

export async function listUsers(query: ListUsersQuery) {
  const { page, pageSize, skip, take } = parsePagination(query)
  const statuses = parseArrayParam(query.status)
  const roles = parseArrayParam(query.role)

  const where: Prisma.UserWhereInput = {
    ...(query.username
      ? {
          OR: [
            { username: { contains: String(query.username) } },
            { firstName: { contains: String(query.username) } },
            { lastName: { contains: String(query.username) } },
            { email: { contains: String(query.username) } },
          ],
        }
      : {}),
    ...(statuses.length ? { status: { in: statuses } } : {}),
    ...(roles.length ? { role: { in: roles } } : {}),
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    data: users.map(toUserResponse),
    meta: buildMeta(page, pageSize, total),
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw notFound('用户不存在。')
  return toUserResponse(user)
}

export async function createUser(input: z.infer<typeof createUserSchema>) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  })
  if (existing) {
    throw conflict('邮箱或用户名已存在。')
  }

  const count = await prisma.user.count()
  const passwordHash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      accountNo: `ACC${String(count + 1).padStart(3, '0')}`,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash,
      role: input.role,
      status: input.status ?? 'active',
    },
  })

  return toUserResponse(user)
}

export async function updateUser(
  id: string,
  input: z.infer<typeof updateUserSchema>
) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw notFound('用户不存在。')

  if (input.email || input.username) {
    const conflictUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(input.email ? [{ email: input.email }] : []),
              ...(input.username ? [{ username: input.username }] : []),
            ],
          },
        ],
      },
    })
    if (conflictUser) {
      throw conflict('邮箱或用户名已存在。')
    }
  }

  const data: Prisma.UserUpdateInput = { ...input }

  const updated = await prisma.user.update({ where: { id }, data })
  return toUserResponse(updated)
}

/**
 * 管理员重置用户密码为默认密码 User1234
 * 业务规则：管理员无权修改用户密码，只能重置为系统默认密码
 * 用户首次使用默认密码登录后，应自行修改密码
 */
export const DEFAULT_RESET_PASSWORD = 'User1234'

export async function resetUserPassword(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw notFound('用户不存在。')

  const passwordHash = await bcrypt.hash(DEFAULT_RESET_PASSWORD, 10)
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  })

  return {
    message: `用户密码已重置为默认密码 ${DEFAULT_RESET_PASSWORD}，请通知用户登录后及时修改。`,
    defaultPassword: DEFAULT_RESET_PASSWORD,
  }
}

function assertNotSelfDelete(
  targetUserId: string,
  operatorId: string,
  targetRole: string
) {
  if (targetUserId === operatorId && targetRole === 'superadmin') {
    throw forbidden('超级管理员不能删除自己。')
  }
}

export async function deleteUser(id: string, operatorId: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw notFound('用户不存在。')
  assertNotSelfDelete(id, operatorId, user.role)
  await prisma.user.delete({ where: { id } })
}

export async function bulkDeleteUsers(ids: string[], operatorId: string) {
  if (!ids.length) throw badRequest('请选择至少一个用户。')

  if (ids.includes(operatorId)) {
    const operator = await prisma.user.findUnique({ where: { id: operatorId } })
    if (operator?.role === 'superadmin') {
      throw forbidden('超级管理员不能删除自己。')
    }
  }

  const result = await prisma.user.deleteMany({ where: { id: { in: ids } } })
  return { deleted: result.count }
}

export async function inviteUser(
  input: z.infer<typeof inviteUserSchema>,
  invitedById: string
) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) {
    throw conflict('该邮箱已注册。')
  }

  const invite = await prisma.userInvite.create({
    data: {
      email: input.email,
      role: input.role,
      description: input.desc,
      invitedById,
    },
  })

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    description: invite.description,
    status: invite.status,
    createdAt: invite.createdAt.toISOString(),
    message: `邀请已发送至 ${input.email}`,
  }
}

export async function listInvites() {
  const invites = await prisma.userInvite.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return invites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    description: i.description,
    status: i.status,
    createdAt: i.createdAt.toISOString(),
  }))
}
