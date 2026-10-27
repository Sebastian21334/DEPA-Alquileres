import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IMailService,
  ReservaEmailDetalle,
  ReprogramacionEmailDetalle,
} from '../mail.interface';
import { CORREO_REPOSITORY } from '../repository/correo.repository.interface';
import type { ICorreoRepository } from '../repository/correo.repository.interface';
import { MailPlantilla } from '../presentation/mail-plantilla';

@Injectable()
export class MailService implements IMailService {
  private readonly frontendUrl: string;

  constructor(
    @Inject(CORREO_REPOSITORY) private readonly correos: ICorreoRepository,
    private readonly plantillas: MailPlantilla,
    config: ConfigService,
  ) {
    this.frontendUrl = config
      .getOrThrow<string>('FRONTEND_URLS')
      .split(',')[0]
      .trim();
  }

  async enviarVerificacion(destinatario: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verificar-cuenta?token=${token}`;

    await this.enviar(
      destinatario,
      'Verificá tu cuenta de DEPA',
      `<p style="margin:0 0 16px">Gracias por registrarte en DEPA. Para proteger tu cuenta necesitamos confirmar que este correo te pertenece.</p>
       ${this.plantillas.boton('Verificar mi cuenta', link)}
       <p style="margin:20px 0 0;color:#667085;font-size:13px">Si no creaste una cuenta en DEPA, podés ignorar este mensaje con tranquilidad.</p>`,
      'Confirmá tu correo para comenzar a usar DEPA.',
    );
  }

  async enviarReprogramacionReserva(
    destinatario: string,
    detalle: ReprogramacionEmailDetalle,
  ): Promise<void> {
    const dia = (valor: string) =>
      this.plantillas.fecha(new Date(`${valor}T12:00:00Z`));
    await this.enviar(
      destinatario,
      `Cambio de fechas en la reserva #${detalle.idReserva} — ${detalle.titulo}`,
      `<p>Hola <strong>${this.plantillas.escapar(detalle.nombreAnunciante)}</strong>,
        <strong>${this.plantillas.escapar(detalle.nombreInquilino)}</strong> reprogramó su reserva de
        <strong>${this.plantillas.escapar(detalle.titulo)}</strong>.</p>
       <p><strong>Fechas anteriores:</strong> ${dia(detalle.inicioAnterior)} al ${dia(detalle.finAnterior)}.</p>
       <p><strong>Nuevas fechas:</strong> ${dia(detalle.inicioNuevo)} al ${dia(detalle.finNuevo)}.</p>
       <p>Se mantienen los ${detalle.cantidadDias} días y el total pagado de
         <strong>${this.plantillas.importe(detalle.monto, detalle.moneda)}</strong>.
         El calendario ya fue actualizado. Este cambio no genera cobros ni devoluciones.</p>
       ${this.plantillas.conversion(detalle.conversion)}
       <p>Si hubo otros cambios, consultá la reserva para ver las fechas vigentes.</p>
       ${this.plantillas.boton('Ver reserva', `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`)}`,
      `El inquilino cambió las fechas de la reserva #${detalle.idReserva}.`,
    );
  }

  async enviarRecuperacion(destinatario: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/restablecer-contrasena?token=${token}`;

    await this.enviar(
      destinatario,
      'Restablecé tu contraseña de DEPA',
      `<p style="margin:0 0 16px">Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
       ${this.plantillas.boton('Crear una contraseña nueva', link)}
       <p style="margin:20px 0 0;color:#667085;font-size:13px">El enlace vence en una hora. Si no solicitaste el cambio, no hace falta que hagas nada.</p>`,
      'Usá este enlace seguro para recuperar el acceso a tu cuenta.',
    );
  }

  async enviarResultadoVerificacion(
    destinatario: string,
    aprobada: boolean,
    motivo?: string,
  ): Promise<void> {
    // El mismo método cubre los dos resultados administrativos.
    const asunto = aprobada
      ? 'Verificación de identidad aprobada'
      : 'Verificación de identidad rechazada';
    // El motivo proviene de un administrador y se escapa antes de insertarse en HTML.
    const motivoSeguro = this.plantillas.escapar(
      motivo ?? 'Documentación no válida',
    );
    const contenido = aprobada
      ? '<p>Tu identidad fue verificada correctamente. Ya podés publicar propiedades.</p>'
      : `<p>Tu solicitud de verificación fue rechazada.</p><p>Motivo: ${motivoSeguro}</p><p>Podés cargar nuevamente la documentación desde tu cuenta.</p>`;

    await this.enviar(
      destinatario,
      asunto,
      contenido,
      aprobada
        ? 'Tu perfil ya está habilitado para publicar propiedades.'
        : 'Revisá el resultado de la validación de tu identidad.',
    );
  }

  async enviarReservaConfirmada(
    destinatario: string,
    detalle: ReservaEmailDetalle,
  ): Promise<void> {
    const enlace = `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`;
    await this.enviar(
      destinatario,
      `Reserva #${detalle.idReserva} confirmada — ${detalle.titulo}`,
      `<p style="margin:0 0 16px">Hola <strong>${this.plantillas.escapar(detalle.nombreDestinatario)}</strong>, tu pago fue acreditado y la estadía quedó confirmada.</p>
       ${this.plantillas.detalleReserva(detalle)}
       <div style="margin:20px 0;padding:16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534">
         <strong>Contacto del anfitrión</strong><br>
         ${this.plantillas.escapar(detalle.nombreContraparte)}<br>
         ${detalle.emailContraparte ? this.plantillas.escapar(detalle.emailContraparte) : 'Correo no informado'} · ${detalle.telefonoContraparte ? this.plantillas.escapar(detalle.telefonoContraparte) : 'Teléfono no informado'}
       </div>
       ${this.plantillas.boton('Ver reserva y comprobante', enlace)}
       ${this.plantillas.avisoContacto()}`,
      `Tu pago se acreditó y la reserva #${detalle.idReserva} quedó confirmada.`,
    );
  }

  async enviarNuevaReserva(
    destinatario: string,
    detalle: ReservaEmailDetalle,
  ): Promise<void> {
    const enlace = `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`;
    await this.enviar(
      destinatario,
      `Nueva reserva pagada #${detalle.idReserva} — ${detalle.titulo}`,
      `<p style="margin:0 0 16px">Hola <strong>${this.plantillas.escapar(detalle.nombreDestinatario)}</strong>, recibiste una nueva reserva con el pago acreditado.</p>
       ${this.plantillas.detalleReserva(detalle)}
       <div style="margin:20px 0;padding:16px;border-radius:10px;background:#eef4ff;border:1px solid #c7d7fe;color:#163a70">
         <strong>Datos del huésped</strong><br>
         ${this.plantillas.escapar(detalle.nombreContraparte)}<br>
         ${detalle.emailContraparte ? this.plantillas.escapar(detalle.emailContraparte) : 'Correo no informado'} · ${detalle.telefonoContraparte ? this.plantillas.escapar(detalle.telefonoContraparte) : 'Teléfono no informado'}
       </div>
       ${this.plantillas.boton('Ver reserva y contactar', enlace)}
       ${this.plantillas.avisoContacto()}`,
      `${detalle.nombreContraparte} reservó ${detalle.titulo}.`,
    );
  }

  async enviarMensajeNuevo(
    destinatario: string,
    nombreDestinatario: string,
    nombreRemitente: string,
    titulo: string,
    idPublicacion: number,
  ): Promise<void> {
    await this.enviar(
      destinatario,
      `${nombreRemitente} te envió un mensaje en DEPA`,
      `<p style="margin:0 0 16px">Hola <strong>${this.plantillas.escapar(nombreDestinatario)}</strong>, <strong>${this.plantillas.escapar(nombreRemitente)}</strong> te escribió por la publicación <strong>${this.plantillas.escapar(titulo)}</strong>.</p>
       <p style="margin:0 0 20px;color:#667085">Respondé desde la mensajería interna para que la conversación quede asociada a la publicación.</p>
       ${this.plantillas.boton('Abrir publicación y responder', `${this.frontendUrl}/publicaciones/${idPublicacion}`)}`,
      `Tenés un nuevo mensaje relacionado con ${titulo}.`,
    );
  }

  async enviarSolicitudAnunciante(destinatario: string): Promise<void> {
    await this.enviar(
      destinatario,
      'Recibimos tus datos de anunciante',
      `<p>Guardamos correctamente la primera parte de tu solicitud.</p><p>Para enviarla a revisión todavía tenés que completar la captura del DNI, la prueba de vida y la comparación facial.</p>${this.plantillas.boton('Continuar verificación', `${this.frontendUrl}/mi-perfil/anunciante`)}`,
      'Tu solicitud de anunciante quedó guardada.',
    );
  }

  async enviarSolicitudParaRevision(
    destinatarios: string[],
    nombreSolicitante: string,
    emailSolicitante: string,
  ): Promise<void> {
    await Promise.all(
      destinatarios.map((email) =>
        this.enviar(
          email,
          'Nueva solicitud de anunciante para revisar',
          `<p><strong>${this.plantillas.escapar(nombreSolicitante)}</strong> envió su documentación para ser anunciante.</p><p>Contacto: ${this.plantillas.escapar(emailSolicitante)}.</p>${this.plantillas.boton('Abrir panel administrativo', `${this.frontendUrl}/admin`)}`,
          'Hay una nueva solicitud de identidad pendiente de revisión.',
        ),
      ),
    );
  }

  async enviarCambioBloqueo(
    destinatario: string,
    bloqueado: boolean,
    motivo?: string,
  ): Promise<void> {
    const motivoSeguro = motivo
      ? `<p>Motivo: ${this.plantillas.escapar(motivo)}</p>`
      : '';
    const contenido = bloqueado
      ? `<p>Tu cuenta fue bloqueada y no podrás iniciar sesión.</p>${motivoSeguro}<p>Si creés que se trata de un error, comunicate con soporte.</p>`
      : '<p>Tu cuenta fue habilitada nuevamente. Ya podés iniciar sesión.</p>';
    await this.enviar(
      destinatario,
      bloqueado
        ? 'Tu cuenta de DEPA fue bloqueada'
        : 'Tu cuenta de DEPA fue habilitada',
      contenido,
      bloqueado
        ? 'Información importante sobre el acceso a tu cuenta.'
        : 'Ya podés volver a ingresar a DEPA.',
    );
  }

  async enviarBajaPublicacion(
    destinatario: string,
    titulo: string,
    motivo: string,
  ): Promise<void> {
    await this.enviar(
      destinatario,
      'Tu publicación fue desactivada por un administrador',
      `<p>Un administrador dio de baja tu publicación <strong>${this.plantillas.escapar(titulo)}</strong>.</p>
       <p><strong>Motivo:</strong> ${this.plantillas.escapar(motivo)}</p>
       <p>La publicación se conserva en tu cuenta y ya no aparece en el catálogo público.</p>
       ${this.plantillas.boton('Ver mis publicaciones', `${this.frontendUrl}/mis-publicaciones`)}`,
      'Información sobre la baja administrativa de tu publicación.',
    );
  }

  private enviar(
    destinatario: string,
    asunto: string,
    html: string,
    preheader = 'Tenés una novedad en tu cuenta de DEPA.',
  ): Promise<void> {
    return this.correos.enviar({
      destinatario,
      asunto,
      html: this.plantillas.plantilla(preheader, html),
    });
  }
}
