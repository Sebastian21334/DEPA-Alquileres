// mensajes/servicio/mensajes.service.ts
import {
  Inject,
  Injectable,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { Mensaje } from '../entity/mensaje.entity';
import { EnviarMensajeDto } from '../dto/enviar-mensaje.dto';
import type { IMensajeRepository } from '../repository/mensaje.repository.interface';
import { MENSAJE_REPOSITORY } from '../repository/mensaje.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import type { IMailMensajes } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import { ReservasService } from '../../reservas/service/reservas.service';
import type { ConversacionResumen, MensajeRespuesta, ParticipanteMensaje } from '../dto/mensaje-respuesta.dto';
import type { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import type { EntityManager } from 'typeorm';

@Injectable()
export class MensajesService {
  private readonly logger = new Logger(MensajesService.name);
  // Se comunica con el service de Publicaciones, nunca con su repositorio directo
  constructor(@Inject(MENSAJE_REPOSITORY) private readonly mensajeRepository: IMensajeRepository, private readonly publicacionesService: PublicacionesService, private readonly usuariosService: UsuariosService, private readonly reservasService: ReservasService, @Inject(MAIL_SERVICE) private readonly mailService: IMailMensajes) {}

  /**
   * Envía un mensaje. No hace falta crear un "chat" antes: la conversación
   * queda implícitamente definida por (publicacion, origen, destino) apenas
   * se guarda el primer mensaje.
   */
  async enviar(dto: EnviarMensajeDto, idUsuarioOrigen: number): Promise<MensajeRespuesta> {
    if (idUsuarioOrigen === dto.id_destino_usuario) {
      throw new BadRequestException('No podés enviarte un mensaje a vos mismo');
    }
    const publicacion = await this.publicacionesService.buscarPorId(
      dto.id_publicacion,
    );
    if (publicacion.eliminada) {
      throw new ConflictException(
        'No se pueden enviar mensajes: esta publicación ha sido eliminada',
      );
    }
    await this.validarDestinatario(publicacion, idUsuarioOrigen, dto.id_destino_usuario);

    const { guardado, destinatario, remitente } = await this.mensajeRepository.conTransaccion((mensajes, transaccion) =>
      this.guardarMensaje(dto, idUsuarioOrigen, publicacion, mensajes, transaccion),
    );
    await this.avisarMensajeNuevo(destinatario, remitente, publicacion);
    return this.prepararRespuesta({ ...guardado, origenUsuario: remitente, destinoUsuario: destinatario });
  }

  /**
   * El inquilino puede escribirle al anunciante de la publicación. El anunciante
   * solo puede iniciar el chat con un huésped que tenga una reserva aprobada, o
   * continuar una conversación que ese huésped ya hubiera iniciado.
   */
  private async validarDestinatario(publicacion: Publicacion, idUsuarioOrigen: number, idDestino: number): Promise<void> {
    if (this.publicacionesService.perteneceA(publicacion, idDestino)) return;
    const esAnunciante = this.publicacionesService.perteneceA(publicacion, idUsuarioOrigen);
    const [hayConversacion, hayReservaAprobada] = esAnunciante
      ? await Promise.all([
          this.mensajeRepository.existeConversacion(publicacion.id, idUsuarioOrigen, idDestino),
          this.reservasService.existeReservaAprobada(publicacion.id, idDestino),
        ])
      : [false, false];
    if (!esAnunciante || !(hayConversacion || hayReservaAprobada)) {
      throw new ForbiddenException(
        'El destinatario no es el anunciante de esta publicación',
      );
    }
  }

  /** Guarda el mensaje con la publicación bloqueada y las dos cuentas vigentes. */
  private async guardarMensaje(dto: EnviarMensajeDto, idUsuarioOrigen: number, publicacion: Publicacion, mensajes: IMensajeRepository, transaccion: EntityManager): Promise<{ guardado: Mensaje; destinatario: Usuario; remitente: Usuario }> {
    await this.publicacionesService.bloquearParaModificacion(dto.id_publicacion, transaccion, false);
    const [destinatario, remitente] = await Promise.all([
      this.usuariosService.buscarPorId(dto.id_destino_usuario, transaccion),
      this.usuariosService.buscarPorId(idUsuarioOrigen, transaccion),
    ]);
    if (!destinatario) {
      throw new NotFoundException('El destinatario no existe');
    }
    // Se decide por la cuenta del destinatario y no por publicacion.activa:
    // un Anunciante activo puede pausar una publicación y sus Inquilinos con
    // reserva tienen que poder seguir escribiéndole.
    if (!destinatario.activa) {
      throw new ConflictException(
        'No podés enviarle mensajes a esta cuenta porque fue dada de baja',
      );
    }
    if (!remitente?.activa) {
      throw new ConflictException('El contacto está suspendido porque la cuenta está inactiva.');
    }

    const mensaje = mensajes.crear({
      texto: dto.texto,
      fecha: new Date(),
      leido: false,
      fecha_lectura: null,
      origenUsuario: Object.assign(new Usuario(), { id: idUsuarioOrigen }),
      destinoUsuario: Object.assign(new Usuario(), {
        id: dto.id_destino_usuario,
      }),
      publicacion: publicacion,
    });
    return { guardado: await mensajes.guardar(mensaje), destinatario, remitente };
  }

  /** El aviso por correo no deshace un mensaje ya guardado. */
  private async avisarMensajeNuevo(destinatario: Usuario, remitente: Usuario, publicacion: Publicacion): Promise<void> {
    // El destinatario está activo (se validó al guardar), así que tiene email vigente.
    if (!destinatario.email) return;
    try {
      await this.mailService.enviarMensajeNuevo(
        destinatario.email,
        this.usuariosService.nombreCompleto(destinatario),
        this.usuariosService.nombreCompleto(remitente),
        publicacion.titulo,
        publicacion.id,
      );
    } catch (error) {
      // Se registra la cuenta, no el correo: el log no debe guardar datos personales.
      this.logger.error(
        `No se pudo enviar el aviso de chat al usuario ${destinatario.id}`,
        error as Error,
      );
    }
  }

  /**
   * Devuelve todos los mensajes de una conversación puntual, validando
   * que quien pide sea uno de los dos participantes.
   */
  async listarConversacion(idPublicacion: number, idOtroUsuario: number, idUsuarioActual: number): Promise<MensajeRespuesta[]> {
    // El repositorio busca ambos sentidos del intercambio (A->B y B->A).
    const mensajes = await this.mensajeRepository.buscarConversacion(
      idPublicacion,
      idUsuarioActual,
      idOtroUsuario,
    );

    if (mensajes.length === 0) return [];

    const esParticipante = mensajes.some(
      (m) =>
        m.origenUsuario.id === idUsuarioActual ||
        m.destinoUsuario.id === idUsuarioActual,
    );

    if (!esParticipante) {
      throw new ForbiddenException('No formás parte de esta conversación');
    }

    const { origenUsuario, destinoUsuario, publicacion } = mensajes[0];
    const contactoSuspendido = publicacion.eliminada ||
      (!origenUsuario.activa || !destinoUsuario.activa);
    return mensajes.map((mensaje) => ({ ...this.prepararRespuesta(mensaje), contactoSuspendido }));
  }

  /**
   * Arma la "bandeja de entrada" del usuario: una fila por cada conversación
   * distinta (publicación + interlocutor), con su último mensaje, de la más
   * reciente a la más vieja.
   */
  async listarConversaciones(idUsuario: number): Promise<ConversacionResumen[]> {
    const ultimos = await this.mensajeRepository.buscarUltimosPorConversacion(idUsuario);
    return ultimos.map(({ mensaje, noLeidos }) => ({
      idPublicacion: mensaje.publicacion.id,
      idOtroUsuario: mensaje.origenUsuario.id === idUsuario ? mensaje.destinoUsuario.id : mensaje.origenUsuario.id,
      ultimoMensaje: this.prepararRespuesta(mensaje),
      cantidadNoLeidos: noLeidos,
    }));
  }

  private prepararRespuesta(mensaje: Mensaje): MensajeRespuesta {
    const { id, texto, fecha, leido, fecha_lectura, publicacion } = mensaje;
    return {
      id, texto, fecha, leido, fecha_lectura,
      origenUsuario: this.participante(mensaje.origenUsuario),
      destinoUsuario: this.participante(mensaje.destinoUsuario),
      publicacion: { id: publicacion.id, titulo: publicacion.titulo, eliminada: publicacion.eliminada },
    };
  }

  private participante({ id, nombre, apellido, foto_url }: Usuario): ParticipanteMensaje {
    return { id, nombre, apellido, foto_url: foto_url ?? null };
  }

  /** Marca como leídos solamente los mensajes que el usuario recibió en este chat. */
  async marcarConversacionComoLeida(idPublicacion: number, idOtroUsuario: number, idUsuarioActual: number): Promise<void> {
    await this.mensajeRepository.marcarConversacionComoLeida(
      idPublicacion,
      idOtroUsuario,
      idUsuarioActual,
    );
  }
}
