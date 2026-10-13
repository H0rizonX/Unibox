import { Router } from 'express'
import { routeParam } from '../lib/route-param.js'
import {
  type AuthRequest,
  authenticate,
  requireRoles,
} from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'
import * as rolesService from '../services/roles.service.js'
import { createRoleSchema, updateRoleSchema } from '../validators/schemas.js'

export const rolesRouter = Router()

rolesRouter.use(authenticate)

rolesRouter.get(
  '/',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (_req, res) => {
    const result = await rolesService.listRoles()
    res.suc(result)
  })
)

rolesRouter.get(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const result = await rolesService.getRoleById(routeParam(req.params.id))
    res.suc(result)
  })
)

rolesRouter.post(
  '/',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const body = createRoleSchema.parse(req.body)
    const result = await rolesService.createRole(body)
    res.suc(result, { status: 201 })
  })
)

rolesRouter.patch(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    const body = updateRoleSchema.parse(req.body)
    const result = await rolesService.updateRole(
      routeParam(req.params.id),
      body
    )
    res.suc(result)
  })
)

rolesRouter.delete(
  '/:id',
  requireRoles('superadmin', 'admin'),
  asyncHandler(async (req, res) => {
    await rolesService.deleteRole(routeParam(req.params.id))
    res.suc(null, { status: 204 })
  })
)
