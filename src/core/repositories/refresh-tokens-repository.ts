export interface RefreshTokenData {
  id: string
  token: string
  userId: string
  familyId: string
  revoked: boolean
  expiresAt: Date
  createdAt: Date
}

export interface CreateRefreshTokenData {
  token: string
  userId: string
  familyId: string
  expiresAt: Date
}

export abstract class RefreshTokensRepository {
  abstract create(data: CreateRefreshTokenData): Promise<void>
  abstract findByToken(tokenHash: string): Promise<RefreshTokenData | null>
  abstract revokeByToken(tokenHash: string): Promise<void>
  abstract revokeByFamily(familyId: string): Promise<void>
  abstract revokeAllByUserId(userId: string): Promise<void>
  abstract deleteExpired(): Promise<void>
}
