import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MAIL_SERVICE } from './mail.interface';
import { MailPlantilla } from './presentation/mail-plantilla';
import { AzureCorreoProveedor, clienteCorreoAzure } from './proveedor/azure-correo.proveedor';
import { PROVEEDOR_CORREO } from './proveedor/proveedor-correo.interface';

@Module({
  providers: [
    clienteCorreoAzure,
    MailService,
    MailPlantilla,
    AzureCorreoProveedor,
    { provide: PROVEEDOR_CORREO, useExisting: AzureCorreoProveedor },
    { provide: MAIL_SERVICE, useExisting: MailService },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
