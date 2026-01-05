import { Module } from '@nestjs/common'
import { Encrypter } from '@/core/cryptography/encrypter.js'
import { HashComparer } from '@/core/cryptography/hash-comparer.js'
import { HashGenerator } from '@/core/cryptography/hash-generator.js'
import { JwtEncrypter } from '@/infra/cryptography/jwt-encrypter.js'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher.js'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
