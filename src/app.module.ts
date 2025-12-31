import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module.js';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
  ],
})
export class AppModule {}
