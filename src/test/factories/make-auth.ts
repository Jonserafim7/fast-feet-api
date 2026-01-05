import type { JwtService } from '@nestjs/jwt'
import type { Role } from '@/generated/prisma/client.js'

export interface AuthTokenPayload {
  sub: string
  role: Role
}

export function makeAccessToken(
  jwt: JwtService,
  payload: AuthTokenPayload
): Promise<string> {
  return jwt.signAsync(payload)
}
