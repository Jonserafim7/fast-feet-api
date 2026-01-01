import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env.js';
import { EnvModule } from './env/env.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CryptographyModule } from './cryptography/cryptography.module.js';
import { HttpModule } from './http/http.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    DatabaseModule,
    CryptographyModule,
    HttpModule,
    AuthModule,
  ],
})
export class AppModule {}
