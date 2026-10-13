import { badRequest, notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

export type RoleInput = {
  name: string
  label: string
  description?: string
  permissions: string[]
}

export async function listRoles() {
  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
  })

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: JSON.parse(role.permissions) as string[],
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }))
}

export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    throw notFound('角色不存在。')
  }

  return {
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: JSON.parse(role.permissions) as string[],
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }
}

export async function createRole(input: RoleInput) {
  const existing = await prisma.role.findUnique({ where: { name: input.name } })
  if (existing) {
    throw badRequest('角色名称已存在。')
  }

  if (input.name === 'superadmin') {
    throw badRequest('禁止创建超级管理员角色。')
  }

  const role = await prisma.role.create({
    data: {
      name: input.name,
      label: input.label,
      description: input.description,
      permissions: JSON.stringify(input.permissions),
      isSystem: false,
    },
  })

  return {
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: JSON.parse(role.permissions) as string[],
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }
}

export async function updateRole(id: string, input: Partial<RoleInput>) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    throw notFound('角色不存在。')
  }

  if (role.isSystem) {
    throw badRequest('系统角色不可编辑。')
  }

  if (input.name && input.name !== role.name) {
    const existing = await prisma.role.findUnique({
      where: { name: input.name },
    })
    if (existing) {
      throw badRequest('角色名称已存在。')
    }

    if (input.name === 'superadmin') {
      throw badRequest('禁止修改为超级管理员角色。')
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      name: input.name,
      label: input.label,
      description: input.description,
      permissions: input.permissions
        ? JSON.stringify(input.permissions)
        : undefined,
    },
  })

  return {
    id: updated.id,
    name: updated.name,
    label: updated.label,
    description: updated.description,
    permissions: JSON.parse(updated.permissions) as string[],
    isSystem: updated.isSystem,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  }
}

export async function deleteRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    throw notFound('角色不存在。')
  }

  if (role.isSystem) {
    throw badRequest('系统角色不可删除。')
  }

  const usersWithRole = await prisma.user.count({ where: { role: role.name } })
  if (usersWithRole > 0) {
    throw badRequest(
      `有 ${usersWithRole} 个用户使用该角色，请先更改用户角色后再删除。`
    )
  }

  await prisma.role.delete({ where: { id } })
}
