import { createClient } from 'redis'
import { env } from '../config/env.js'

export const redis = createClient({ url: env.REDIS_URL })

redis.on('error', (err) => {
  console.error('[Redis]', err.message)
})

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect()
  }
  console.log('Redis connected')
}

export async function disconnectRedis(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit()
  }
}

const EMAIL_RATE_LIMIT_TTL = 60

function emailRateLimitKey(email: string): string {
  return `email_rate_limit:${email.toLowerCase()}`
}

export async function checkEmailRateLimit(email: string): Promise<{
  allowed: boolean
  remainingSeconds: number
}> {
  const key = emailRateLimitKey(email)
  const ttl = await redis.ttl(key)

  if (ttl > 0) {
    return { allowed: false, remainingSeconds: ttl }
  }

  return { allowed: true, remainingSeconds: 0 }
}

export async function setEmailRateLimit(email: string): Promise<void> {
  const key = emailRateLimitKey(email)
  await redis.setEx(key, EMAIL_RATE_LIMIT_TTL, '1')
}
