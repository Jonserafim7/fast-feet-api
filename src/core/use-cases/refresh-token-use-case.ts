import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/errors/either.js'
import { InvalidRefreshTokenError } from '@/core/errors/invalid-refresh-token-error.js'
import { RefreshTokenReuseDetectedError } from '@/core/errors/refresh-token-reuse-detected-error.js'
import { RefreshTokensRepository } from '@/core/repositories/refresh-tokens-repository.js'
import { UsersRepository } from '@/core/repositories/users-repository.js'
import { Encrypter } from '@/core/cryptography/encrypter.js'
import { TokenHasher } from '@/core/cryptography/token-hasher.js'

interface RefreshTokenUseCaseRequest {
  refreshToken: string
  refreshTokenExpiresInMs: number
}

type RefreshTokenUseCaseResponse = Either<
  InvalidRefreshTokenError | RefreshTokenReuseDetectedError,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly usersRepository: UsersRepository,
    private readonly encrypter: Encrypter,
    private readonly tokenHasher: TokenHasher
  ) {}

  async execute({
    refreshToken,
    refreshTokenExpiresInMs,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const tokenHash = this.tokenHasher.hash(refreshToken)
    const storedToken = await this.refreshTokensRepository.findByToken(tokenHash)

    if (!storedToken) {
      return left(new InvalidRefreshTokenError())
    }

    if (storedToken.revoked) {
      await this.refreshTokensRepository.revokeByFamily(storedToken.familyId)
      return left(new RefreshTokenReuseDetectedError())
    }

    if (storedToken.expiresAt < new Date()) {
      return left(new InvalidRefreshTokenError())
    }

    await this.refreshTokensRepository.revokeByToken(tokenHash)

    const user = await this.usersRepository.findById(storedToken.userId)

    if (!user) {
      return left(new InvalidRefreshTokenError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    })

    const rawNewRefreshToken = this.tokenHasher.generate()
    const newRefreshTokenHash = this.tokenHasher.hash(rawNewRefreshToken)

    await this.refreshTokensRepository.create({
      token: newRefreshTokenHash,
      userId: user.id,
      familyId: storedToken.familyId,
      expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
    })

    return right({ accessToken, refreshToken: rawNewRefreshToken })
  }
}
