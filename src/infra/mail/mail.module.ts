import { Module } from '@nestjs/common'
import { MailProvider } from '@/core/providers/mail-provider.js'
import { EtherealMailProvider } from './ethereal-mail-provider.js'

@Module({
  providers: [
    {
      provide: MailProvider,
      useClass: EtherealMailProvider,
    },
  ],
  exports: [MailProvider],
})
export class MailModule {}
