import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '@/infra/database/prisma/prisma.service.js';
import { EnvService } from '@/infra/env/env.service.js';
import { EnvModule } from '@/infra/env/env.module.js';
import { JwtStrategy } from '@/infra/auth/jwt.strategy.js';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard.js';
import { RolesGuard } from '@/infra/auth/roles.guard.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      global: true,
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const privateKey = envService.get('JWT_PRIVATE_KEY');
        const publicKey = envService.get('JWT_PUBLIC_KEY');
        return {
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
          signOptions: {
            algorithm: 'RS256',
          },
        };
      },
    }),
    EnvModule,
  ],
  providers: [
    PrismaService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
