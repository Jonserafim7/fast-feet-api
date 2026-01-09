import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  DATABASE_SCHEMA: z
    .union([
      z.uuid(), // UUIDs (E2E tests) - allows hyphens
      z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/), // Valid PostgreSQL identifiers
    ])
    .optional(),
  JWT_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(86400),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string().email(),
})

export type Env = z.infer<typeof envSchema>
