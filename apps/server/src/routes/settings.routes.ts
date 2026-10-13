import { Router } from 'express'
import { asyncHandler } from '../middleware/error-handler.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import {
  accountSchema,
  createConversationSchema,
  notificationsSchema,
  profileSchema,
  sendMessageSchema,
} from '../validators/schemas.js'
import * as settingsService from '../services/settings.service.js'
import { routeParam } from '../lib/route-param.js'

export const settingsRouter = Router()

settingsRouter.use(authenticate)

settingsRouter.get(
  '/profile',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await settingsService.getProfile(req.user!.sub)
    res.suc(result)
  })
)

settingsRouter.patch(
  '/profile',
  asyncHandler(async (req: AuthRequest, res) => {
    const body = profileSchema.parse(req.body)
    const result = await settingsService.updateProfile(req.user!.sub, body)
    res.suc(result)
  })
)

settingsRouter.get(
  '/account',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await settingsService.getAccount(req.user!.sub)
    res.suc(result)
  })
)

settingsRouter.patch(
  '/account',
  asyncHandler(async (req: AuthRequest, res) => {
    const body = accountSchema.parse(req.body)
    const result = await settingsService.updateAccount(req.user!.sub, body)
    res.suc(result)
  })
)

settingsRouter.get(
  '/notifications',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await settingsService.getNotifications(req.user!.sub)
    res.suc(result)
  })
)

settingsRouter.patch(
  '/notifications',
  asyncHandler(async (req: AuthRequest, res) => {
    const body = notificationsSchema.parse(req.body)
    const result = await settingsService.updateNotifications(
      req.user!.sub,
      body
    )
    res.suc(result)
  })
)

export const chatsRouter = Router()

chatsRouter.use(authenticate)

chatsRouter.get(
  '/conversations',
  asyncHandler(async (_req, res) => {
    const data = await settingsService.listConversations()
    res.suc(data)
  })
)

chatsRouter.get(
  '/conversations/:id',
  asyncHandler(async (req, res) => {
    const result = await settingsService.getConversation(
      routeParam(req.params.id)
    )
    res.suc(result)
  })
)

chatsRouter.post(
  '/conversations',
  asyncHandler(async (req, res) => {
    const body = createConversationSchema.parse(req.body)
    const result = await settingsService.createConversation(body)
    res.suc(result, { status: 201 })
  })
)

chatsRouter.post(
  '/conversations/:id/messages',
  asyncHandler(async (req, res) => {
    const { message } = sendMessageSchema.parse(req.body)
    const result = await settingsService.sendMessage(
      routeParam(req.params.id),
      message
    )
    res.suc(result, { status: 201 })
  })
)
