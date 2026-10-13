import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { usersRouter } from './users.routes.js'
import { tasksRouter } from './tasks.routes.js'
import { dashboardRouter } from './dashboard.routes.js'
import { settingsRouter, chatsRouter } from './settings.routes.js'
import { rolesRouter } from './roles.routes.js'
import { testRouter } from './test.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => {
  res.suc({ status: 'ok', timestamp: new Date().toISOString() })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/tasks', tasksRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/settings', settingsRouter)
apiRouter.use('/chats', chatsRouter)
apiRouter.use('/roles', rolesRouter)
apiRouter.use('/test', testRouter)
