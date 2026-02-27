import { Module } from '@nestjs/common'
import { Encrypter } from '@/core/cryptography/encrypter.js'
import { HashComparer } from '@/core/cryptography/hash-comparer.js'
import { HashGenerator } from '@/core/cryptography/hash-generator.js'
import { TokenHasher } from '@/core/cryptography/token-hasher.js'
import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter.js'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'
import { Sha256TokenHasher } from '@/infra/cryptography/sha256-token-hasher.js'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: TokenHasher, useClass: Sha256TokenHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator, TokenHasher],
})
export class CryptographyModule {}
