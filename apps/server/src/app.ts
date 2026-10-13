import cors from 'cors'
import express, { type Express } from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { responseMiddleware } from './middleware/response.js'
import { apiRouter } from './routes/index.js'

export function createApp(): Express {
  const app = express()

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    })
  )
  app.use(responseMiddleware)
  app.use(express.json({ strict: false }))
  app.use(express.urlencoded({ extended: true }))

  app.use('/api', apiRouter)

  app.use(errorHandler)

  return app
}
