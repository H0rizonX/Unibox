import { Router } from 'express'
import { asyncHandler } from '../middleware/error-handler.js'
import { snow } from '../utils/snowflake.js'

export const testRouter = Router()

testRouter.get(
  '/getID',
  asyncHandler(async (__, res) => {
    res.suc(snow.nextId(10))
  })
)
