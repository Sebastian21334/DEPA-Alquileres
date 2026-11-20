import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MAIL_SERVICE } from './mail.interface';
import { MailPlantilla } from './presentation/mail-plantilla';
import { AzureCorreoProveedor } from './proveedor/azure-correo.proveedor';
import { CORREO_REPOSITORY } from './repository/correo.repository.interface';
import { CLIENTE_CORREO } from './proveedor/cliente-correo.interface';
import { EmailClient } from '@azure/communication-email';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: CLIENTE_CORREO,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new EmailClient(config.getOrThrow<string>('ACS_CONNECTION_STRING')),
    },
    MailService,
    MailPlantilla,
    AzureCorreoProveedor,
    { provide: CORREO_REPOSITORY, useExisting: AzureCorreoProveedor },
    { provide: MAIL_SERVICE, useExisting: MailService },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
