import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.task.deleteMany()
  await prisma.userInvite.deleteMany()
  await prisma.userNotifications.deleteMany()
  await prisma.userAccount.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()

  const rolesData = [
    {
      name: 'superadmin',
      label: '超级管理员',
      description: '系统超级管理员，拥有所有权限',
      permissions: JSON.stringify([
        'menu:dashboard',
        'menu:users',
        'menu:tasks',
        'menu:settings',
        'menu:chats',
        'menu:help-center',
        'users:view',
        'users:create',
        'users:edit',
        'users:delete',
        'users:invite',
        'tasks:view',
        'tasks:create',
        'tasks:edit',
        'tasks:delete',
        'tasks:import',
        'settings:view',
        'settings:edit',
        'roles:view',
        'roles:edit',
      ]),
      isSystem: true,
    },
    {
      name: 'admin',
      label: '管理员',
      description: '系统管理员，可以管理用户和任务',
      permissions: JSON.stringify([
        'menu:dashboard',
        'menu:users',
        'menu:tasks',
        'menu:settings',
        'menu:chats',
        'menu:help-center',
        'users:view',
        'users:create',
        'users:edit',
        'users:delete',
        'users:invite',
        'tasks:view',
        'tasks:create',
        'tasks:edit',
        'tasks:delete',
        'tasks:import',
        'settings:view',
        'settings:edit',
        'roles:view',
      ]),
      isSystem: true,
    },
    {
      name: 'tenant',
      label: '租户',
      description: '租户用户，可以管理自己的任务',
      permissions: JSON.stringify([
        'menu:dashboard',
        'menu:tasks',
        'menu:settings',
        'menu:chats',
        'menu:help-center',
        'tasks:view',
        'tasks:create',
        'tasks:edit',
        'tasks:delete',
        'settings:view',
        'settings:edit',
      ]),
      isSystem: false,
    },
    {
      name: 'user',
      label: '用户',
      description: '普通用户，只能查看和操作自己的数据',
      permissions: JSON.stringify([
        'menu:dashboard',
        'menu:tasks',
        'menu:settings',
        'menu:chats',
        'menu:help-center',
        'tasks:view',
        'settings:view',
        'settings:edit',
      ]),
      isSystem: false,
    },
  ]

  await prisma.role.createMany({ data: rolesData })

  const passwordHash = await bcrypt.hash('Admin1234', 10)

  const admin = await prisma.user.create({
    data: {
      accountNo: 'ACC001',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@unibox.com',
      phoneNumber: '+86 138 0000 0001',
      passwordHash,
      status: 'active',
      role: 'superadmin',
      profile: {
        create: {
          username: 'admin',
          displayEmail: 'admin@unibox.com',
          bio: 'Unibox 系统管理员',
          urls: JSON.stringify([{ value: 'https://unibox.com' }]),
        },
      },
      account: {
        create: {
          name: 'Admin User',
          dob: new Date('1990-01-01'),
          language: 'zh',
        },
      },
      notifications: {
        create: {
          type: 'all',
          mobile: false,
          communicationEmails: true,
          socialEmails: true,
          marketingEmails: false,
          securityEmails: true,
        },
      },
    },
  })

  console.log('Seed completed.')
  console.log('Admin login: admin@unibox.com / Admin1234')
  console.log(`Created admin id: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
