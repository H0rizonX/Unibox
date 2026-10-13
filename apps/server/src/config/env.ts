import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.coerce.number().default(86400),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  APP_NAME: z.string().default('Unibox'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  OTP_TTL_SECONDS: z.coerce.number().default(180),
})

const parsed = envSchema.parse(process.env)

export const env = {
  ...parsed,
  SMTP_FROM: parsed.SMTP_FROM ?? parsed.SMTP_USER ?? 'noreply@unibox.com',
}
