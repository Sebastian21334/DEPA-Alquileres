import { type IProveedorCorreo, PROVEEDOR_CORREO } from '../proveedor/proveedor-correo.interface';
import {
  type ReservaEmailDetalle,
  type ReprogramacionEmailDetalle,
  type IMailService,
} from '../mail.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailPlantilla } from '../presentation/mail-plantilla';

@Injectable()
export class MailService implements IMailService {
  private readonly frontendUrl: string;
  private readonly frontendUrls: readonly string[];

  constructor(@Inject(PROVEEDOR_CORREO) private readonly correos: IProveedorCorreo, private readonly plantillas: MailPlantilla, config: ConfigService) {
    this.frontendUrls = config
      .getOrThrow<string>('FRONTEND_URLS')
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''));
    this.frontendUrl = this.frontendUrls[0];
  }

  private frontendDeSolicitud(origen?: string): string {
    return origen && this.frontendUrls.includes(origen) ? origen : this.frontendUrl;
  }

  async enviarVerificacion(destinatario: string, token: string, origen?: string): Promise<void> {
    const link = `${this.frontendDeSolicitud(origen)}/verificar-cuenta?token=${token}`;

    await this.enviar(
      destinatario,
      'Verificá tu cuenta de DEPA',
      `<p style="margin:0 0 16px">Gracias por registrarte en DEPA. Para proteger tu cuenta necesitamos confirmar que este correo te pertenece.</p>
       ${this.plantillas.boton('Verificar mi cuenta', link)}
       <p style="margin:20px 0 12px">El enlace vence en 24 horas y solo puede usarse una vez. Si pedís uno nuevo, el anterior deja de funcionar.</p>
       <p style="margin:0;color:#667085;font-size:13px">Si no creaste una cuenta en DEPA, podés ignorar este mensaje con tranquilidad.</p>`,
      'Confirmá tu correo para comenzar a usar DEPA.',
    );
  }

  enviarReactivacion(destinatario: string, token: string, origen?: string): Promise<void> {
    const enlace = `${this.frontendDeSolicitud(origen)}/reactivar-cuenta#${encodeURIComponent(token)}`;
    return this.enviar(
      destinatario,
      'Recuperá tu cuenta de DEPA',
      `<p>Recibimos una solicitud para recuperar una cuenta dada de baja. Abrí el enlace e ingresá la contraseña que usabas en esa cuenta.</p>
       ${this.plantillas.boton('Recuperar mi cuenta', enlace)}
       <p>El enlace vence en 2 horas. Si no pediste recuperar la cuenta, podés ignorar este correo.</p>`,
      'Confirmá que querés recuperar tu cuenta de DEPA.',
    );
  }

  async enviarReprogramacionReserva(destinatario: string, detalle: ReprogramacionEmailDetalle): Promise<void> {
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
       <p style="margin:20px 0 12px">El enlace vence en 2 horas y solo puede usarse una vez. Si pedís uno nuevo, el anterior deja de funcionar.</p>
       <p style="margin:0">Si no solicitaste este cambio, podés ignorar este mensaje.</p>`,
      'Usá este enlace seguro para recuperar el acceso a tu cuenta.',
      { titulo: 'Restablecé tu contraseña', icono: '🔑' },
    );
  }

  async enviarCambioContrasenia(destinatario: string): Promise<void> {
    await this.enviar(
      destinatario,
      'Se modificó la contraseña de tu cuenta de DEPA',
      `<p>La contraseña de tu cuenta fue modificada correctamente.</p>
       <p>Si realizaste este cambio, no necesitás hacer nada más.</p>
       <p>Si no reconocés esta actividad, recuperá el acceso cuanto antes y comunicate con soporte.</p>
       ${this.plantillas.boton('Recuperar acceso a mi cuenta', `${this.frontendUrl}/recuperar-contrasenia`)}`,
      'Aviso de seguridad: se modificó la contraseña de tu cuenta.',
    );
  }

  async enviarResultadoVerificacion(destinatario: string, aprobada: boolean, motivo?: string): Promise<void> {
    // El mismo método cubre los dos resultados administrativos.
    const asunto = aprobada
      ? 'Revisión de anunciante aprobada'
      : 'Tu solicitud de anunciante requiere una corrección';
    // El motivo proviene de un administrador y se escapa antes de insertarse en HTML.
    const motivoSeguro = this.plantillas.escapar(
      motivo ?? 'Documentación no válida',
    );
    const contenido = aprobada
      ? '<p>La revisión fue aprobada. Entrá a Mi perfil para consultar el estado de tu identidad y del CBU para cobrar.</p>'
      : `<p>Revisamos tu solicitud y hay datos por corregir.</p><p>Motivo: ${motivoSeguro}</p><p>Entrá a Mi perfil para ver si tenés que corregir la documentación, el CBU o ambos.</p>`;

    await this.enviar(
      destinatario,
      asunto,
      contenido,
      aprobada
        ? 'Consultá el resultado en Mi perfil.'
        : 'Consultá qué datos tenés que corregir.',
    );
  }

  async enviarReservaConfirmada(destinatario: string, detalle: ReservaEmailDetalle): Promise<void> {
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

  async enviarNuevaReserva(destinatario: string, detalle: ReservaEmailDetalle): Promise<void> {
    const enlace = `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`;
    await this.enviar(
      destinatario,
      `Nueva reserva pagada #${detalle.idReserva} — ${detalle.titulo}`,
      `<p style="margin:0 0 16px">Hola <strong>${this.plantillas.escapar(detalle.nombreDestinatario)}</strong>, recibiste una nueva reserva con el pago acreditado.</p>
       ${this.plantillas.detalleReserva(detalle)}
       <div style="margin:20px 0;padding:16px;border-radius:10px;background:#eef4ff;border:1px solid #c7d7fe;color:#163a70">
         <strong>Huésped</strong><br>
         ${this.plantillas.escapar(detalle.nombreContraparte)}
       </div>
       ${this.plantillas.boton('Ver reserva y contactar', enlace)}
       <p style="margin:16px 0 0">Para comunicarte con el huésped, usá el chat de DEPA en el detalle de la reserva.</p>`,
      `${detalle.nombreContraparte} reservó ${detalle.titulo}.`,
    );
  }

  async enviarMensajeNuevo(destinatario: string, nombreDestinatario: string, nombreRemitente: string, titulo: string, idPublicacion: number): Promise<void> {
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
      `<p>Guardamos correctamente la primera parte de tu solicitud.</p><p>Para enviarla a revisión todavía tenés que completar la captura del DNI y la prueba de vida. Un administrador revisará la correspondencia entre tu captura y el documento.</p>${this.plantillas.boton('Continuar verificación', `${this.frontendUrl}/mi-perfil/anunciante`)}`,
      'Tu solicitud de anunciante quedó guardada.',
    );
  }

  async enviarSolicitudParaRevision(destinatarios: string[], nombreSolicitante: string, emailSolicitante: string): Promise<void> {
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

  async enviarCambioBloqueo(destinatario: string, bloqueado: boolean, motivo?: string, accesoLimitado = false): Promise<void> {
    const motivoSeguro = motivo
      ? `<p>Motivo: ${this.plantillas.escapar(motivo)}</p>`
      : '';
    const avisoPendientes = accesoLimitado
      ? '<p>Podés iniciar sesión para resolver tus operaciones pendientes. Al terminarlas, tu acceso quedará limitado a consultar y apelar el bloqueo.</p>'
      : '';
    const contenido = bloqueado
      ? `<p>Tu cuenta fue bloqueada.</p>${motivoSeguro}${avisoPendientes}<p>Ingresá con tus credenciales para consultar el bloqueo o presentar una apelación.</p>`
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

  async enviarBajaPublicacion(destinatario: string, titulo: string, motivo: string): Promise<void> {
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

  enviarPublicacionActiva(destinatario: string, titulo: string, idPublicacion: number): Promise<void> {
    return this.enviar(
      destinatario,
      'Tu publicación ya está publicada',
      `<p>Tu publicación <strong>${this.plantillas.escapar(titulo)}</strong> ya está visible en el catálogo de DEPA.</p>
       <p>Podés editarla, sumar fotos o desactivarla cuando quieras desde Mis publicaciones.</p>
       ${this.plantillas.boton('Ver publicación', `${this.frontendUrl}/publicaciones/${idPublicacion}`)}`,
      'Tu publicación ya aparece en el catálogo de DEPA.',
    );
  }

  enviarReactivacionPublicacion(destinatario: string, titulo: string): Promise<void> {
    return this.enviar(
      destinatario,
      'Se levantó la baja de tu publicación',
      `<p>Un administrador levantó la baja de tu publicación <strong>${this.plantillas.escapar(titulo)}</strong>.</p>
       <p>La publicación sigue inactiva: cuando quieras volver a mostrarla en el catálogo, activala desde Mis publicaciones.</p>
       ${this.plantillas.boton('Ver mis publicaciones', `${this.frontendUrl}/mis-publicaciones`)}`,
      'Ya podés volver a activar tu publicación.',
    );
  }

  enviarConfirmacionBaja(destinatario: string, token: string, origen?: string): Promise<void> {
    const enlace = `${this.frontendDeSolicitud(origen)}/confirmar-baja#${encodeURIComponent(token)}`;
    return this.enviar(
      destinatario,
      'Confirmá la baja de tu cuenta de DEPA',
      `<p>Recibimos una solicitud para dar de baja tu cuenta. Abrí el enlace y confirmá la baja si querés continuar.</p>
       ${this.plantillas.boton('Revisar y confirmar la baja', enlace)}
       <p>El enlace vence en 30 minutos. Si no pediste la baja, podés ignorar este correo.</p>`,
      'Tu cuenta sigue activa hasta que confirmes la baja.',
    );
  }

  enviarAvisoReserva(destinatario: string, idReserva: number, asunto: string, mensaje: string, panel: 'inquilino' | 'anunciante' | 'admin'): Promise<void> {
    const rutas = { inquilino: '/mis-reservas', anunciante: '/dashboard', admin: '/admin' };
    return this.enviar(
      destinatario,
      asunto,
      `<p>${this.plantillas.escapar(mensaje)}</p><p>Reserva #${this.plantillas.escapar(String(idReserva))}</p>${this.plantillas.boton('Abrir DEPA', this.frontendUrl + rutas[panel])}`,
      mensaje,
    );
  }

  private enviar(destinatario: string, asunto: string, html: string, preheader = 'Tenés una novedad en tu cuenta de DEPA.', encabezado = { titulo: asunto, icono: '✉' }): Promise<void> {
    return this.correos.enviar({
      destinatario,
      asunto,
      html: this.plantillas.plantilla(preheader, html, encabezado.titulo, this.frontendUrl, encabezado.icono),
    });
  }
}
