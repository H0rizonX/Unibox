import type { z } from 'zod'
import { notFound } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import type {
  accountSchema,
  notificationsSchema,
  profileSchema,
} from '../validators/schemas.js'

export async function getProfile(userId: string) {
  let profile = await prisma.userProfile.findUnique({ where: { userId } })
  if (!profile) {
    profile = await prisma.userProfile.create({ data: { userId } })
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  return {
    username: profile.username ?? user.username,
    email: profile.displayEmail ?? user.email,
    bio: profile.bio,
    urls: JSON.parse(profile.urls || '[]') as { value: string }[],
  }
}

export async function updateProfile(
  userId: string,
  input: z.infer<typeof profileSchema>
) {
  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      username: input.username,
      displayEmail: input.email,
      bio: input.bio,
      urls: JSON.stringify(input.urls ?? []),
    },
    update: {
      username: input.username,
      displayEmail: input.email,
      bio: input.bio,
      urls: JSON.stringify(input.urls ?? []),
    },
  })

  return getProfile(userId)
}

export async function getAccount(userId: string) {
  let account = await prisma.userAccount.findUnique({ where: { userId } })
  if (!account) {
    account = await prisma.userAccount.create({ data: { userId } })
  }

  return {
    name: account.name,
    dob: account.dob?.toISOString() ?? null,
    language: account.language,
  }
}

export async function updateAccount(
  userId: string,
  input: z.infer<typeof accountSchema>
) {
  await prisma.userAccount.upsert({
    where: { userId },
    create: {
      userId,
      name: input.name,
      dob: input.dob,
      language: input.language,
    },
    update: {
      name: input.name,
      dob: input.dob,
      language: input.language,
    },
  })

  return getAccount(userId)
}

export async function getNotifications(userId: string) {
  let settings = await prisma.userNotifications.findUnique({
    where: { userId },
  })
  if (!settings) {
    settings = await prisma.userNotifications.create({ data: { userId } })
  }

  return {
    type: settings.type,
    mobile: settings.mobile,
    communication_emails: settings.communicationEmails,
    social_emails: settings.socialEmails,
    marketing_emails: settings.marketingEmails,
    security_emails: settings.securityEmails,
  }
}

export async function updateNotifications(
  userId: string,
  input: z.infer<typeof notificationsSchema>
) {
  await prisma.userNotifications.upsert({
    where: { userId },
    create: {
      userId,
      type: input.type,
      mobile: input.mobile ?? false,
      communicationEmails: input.communication_emails ?? false,
      socialEmails: input.social_emails ?? true,
      marketingEmails: input.marketing_emails ?? false,
      securityEmails: input.security_emails,
    },
    update: {
      type: input.type,
      ...(input.mobile !== undefined ? { mobile: input.mobile } : {}),
      ...(input.communication_emails !== undefined
        ? { communicationEmails: input.communication_emails }
        : {}),
      ...(input.social_emails !== undefined
        ? { socialEmails: input.social_emails }
        : {}),
      ...(input.marketing_emails !== undefined
        ? { marketingEmails: input.marketing_emails }
        : {}),
      securityEmails: input.security_emails,
    },
  })

  return getNotifications(userId)
}

export async function listConversations() {
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: { orderBy: { timestamp: 'asc' } },
    },
    orderBy: { fullName: 'asc' },
  })

  return conversations.map(({ messages, ...conv }) => ({
    ...conv,
    messages: messages.map((m) => ({
      sender: m.sender,
      message: m.message,
      timestamp: m.timestamp.toISOString(),
    })),
  }))
}

export async function getConversation(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  })
  if (!conversation) throw notFound('会话不存在。')

  const { messages, ...conv } = conversation
  return {
    ...conv,
    messages: messages.map((m) => ({
      sender: m.sender,
      message: m.message,
      timestamp: m.timestamp.toISOString(),
    })),
  }
}

export async function createConversation(input: {
  fullName: string
  username: string
  title?: string
  message: string
}) {
  return prisma.conversation.create({
    data: {
      fullName: input.fullName,
      username: input.username,
      title: input.title ?? '',
      messages: {
        create: {
          sender: 'Me',
          message: input.message,
        },
      },
    },
    include: { messages: true },
  })
}

export async function sendMessage(conversationId: string, message: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })
  if (!conversation) throw notFound('会话不存在。')

  const msg = await prisma.message.create({
    data: {
      conversationId,
      sender: 'Me',
      message,
    },
  })

  return {
    sender: msg.sender,
    message: msg.message,
    timestamp: msg.timestamp.toISOString(),
  }
}

export async function getDashboardOverview() {
  const [userCount, taskCount, activeUsers, completedTasks] = await Promise.all(
    [
      prisma.user.count(),
      prisma.task.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.task.count({ where: { status: 'done' } }),
    ]
  )

  return {
    stats: {
      totalRevenue: 0,
      userCount,
      taskCount,
      activeUsers,
      completedTasks,
    },
    chart: [],
    recentSales: await prisma.task.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        assignee: true,
        status: true,
        updatedAt: true,
      },
    }),
  }
}

export async function getDashboardAnalytics() {
  return {
    traffic: {
      totalClicks: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      avgSessionDuration: '0m 0s',
      weeklyChart: [],
    },
    sources: [],
    devices: [],
  }
}
