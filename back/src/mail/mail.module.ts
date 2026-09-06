import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MAIL_SERVICE } from './mail.interface';

@Module({
  providers: [
    MailService,
    // Los consumidores dependen del contrato MAIL_SERVICE y no de Azure directamente.
    { provide: MAIL_SERVICE, useExisting: MailService },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}