import { Router } from 'express'
import { routeParam } from '../lib/route-param.js'
import {
  type AuthRequest,
  authenticate,
  requireRoles,
} from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'
import * as usersService from '../services/users.service.js'
import {
  bulkDeleteSchema,
  createUserSchema,
  inviteUserSchema,
  updateUserSchema,
} from '../validators/schemas.js'

export const usersRouter = Router()

usersRouter.use(authenticate)

usersRouter.get(
  '/',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const result = await usersService.listUsers(req.query)
    res.suc(result)
  })
)

usersRouter.get(
  '/invites',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (_req, res) => {
    const result = await usersService.listInvites()
    res.suc(result)
  })
)

usersRouter.get(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const result = await usersService.getUserById(routeParam(req.params.id))
    res.suc(result)
  })
)

usersRouter.post(
  '/',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const body = createUserSchema.parse(req.body)
    const result = await usersService.createUser(body)
    res.suc(result, { status: 201 })
  })
)

usersRouter.post(
  '/invite',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = inviteUserSchema.parse(req.body)
    const result = await usersService.inviteUser(body, req.user!.sub)
    res.suc(result, { status: 201 })
  })
)

usersRouter.patch(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const body = updateUserSchema.parse(req.body)
    const result = await usersService.updateUser(
      routeParam(req.params.id),
      body
    )
    res.suc(result)
  })
)

/**
 * 管理员重置用户密码为默认密码 (User1234)
 * 业务规则：管理员不能自定义用户密码，只能重置为系统默认密码
 * 限制角色：superadmin, admin
 */
usersRouter.post(
  '/:id/reset-password',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const result = await usersService.resetUserPassword(
      routeParam(req.params.id)
    )
    res.suc(result)
  })
)

usersRouter.delete(
  '/bulk',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { ids } = bulkDeleteSchema.parse(req.body)
    const result = await usersService.bulkDeleteUsers(ids, req.user!.sub)
    res.suc(result)
  })
)

usersRouter.delete(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    await usersService.deleteUser(routeParam(req.params.id), req.user!.sub)
    res.suc(null, { status: 204 })
  })
)
