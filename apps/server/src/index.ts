import 'dotenv/config'
import type { Server } from 'node:http'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { connectRedis, disconnectRedis } from './lib/redis.js'

const app = createApp()
let server: Server

async function start() {
  await connectRedis()

  server = app.listen(env.PORT, () => {
    console.log(`Unibox Server running at http://localhost:${env.PORT}`)
    console.log(`API base URL: http://localhost:${env.PORT}/api`)
    console.log(`Health check: http://localhost:${env.PORT}/api/health`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

async function shutdown() {
  console.log('Shutting down...')
  server?.close()
  await disconnectRedis()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
