import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string().optional(),
})

export const env = envSchema.parse(process.env)
