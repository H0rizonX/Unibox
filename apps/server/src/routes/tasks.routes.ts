import { Router } from 'express'
import multer from 'multer'
import { BizCode } from '../lib/biz-code.js'
import { routeParam } from '../lib/route-param.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'
import * as tasksService from '../services/tasks.service.js'
import {
  bulkDeleteSchema,
  createTaskSchema,
  updateTaskSchema,
} from '../validators/schemas.js'

const upload = multer({ storage: multer.memoryStorage() })

export const tasksRouter = Router()

tasksRouter.use(authenticate)

tasksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.query.all === 'true') {
      const data = await tasksService.getAllTasks()
      return res.suc(data)
    }
    const result = await tasksService.listTasks(req.query)
    res.suc(result)
  })
)

tasksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await tasksService.getTaskById(routeParam(req.params.id))
    res.suc(result)
  })
)

tasksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = createTaskSchema.parse(req.body)
    const result = await tasksService.createTask(body)
    res.suc(result, { status: 201 })
  })
)

tasksRouter.post(
  '/import',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.fail('请上传文件。', {
        status: 400,
        code: BizCode.BAD_REQUEST,
      })
    }
    const result = await tasksService.importTasksFromCsv(req.file.buffer)
    res.suc(result, { status: 201 })
  })
)

tasksRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = updateTaskSchema.parse(req.body)
    const result = await tasksService.updateTask(
      routeParam(req.params.id),
      body
    )
    res.suc(result)
  })
)

tasksRouter.delete(
  '/bulk',
  asyncHandler(async (req, res) => {
    const { ids } = bulkDeleteSchema.parse(req.body)
    const result = await tasksService.bulkDeleteTasks(ids)
    res.suc(result)
  })
)

tasksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await tasksService.deleteTask(routeParam(req.params.id))
    res.suc(null, { status: 204 })
  })
)
