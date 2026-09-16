// mensajes/servicio/mensajes.service.ts
import { Inject, Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { Mensaje } from '../entity/mensaje.entity';
import { EnviarMensajeDto } from '../dto/enviar-mensaje.dto';
import type { IMensajeRepository } from '../repository/mensaje.repository.interface';
import { MENSAJE_REPOSITORY } from '../repository/mensaje.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import type { IMailService } from '../../mail/mail.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';

// Forma que le devolvemos al front para la lista de conversaciones (bandeja de entrada)
export interface ConversacionResumen {
  idPublicacion: number;
  idOtroUsuario: number;
  ultimoMensaje: Mensaje;
  cantidadNoLeidos: number;
}

@Injectable()
export class MensajesService {
  private readonly logger = new Logger(MensajesService.name);
  constructor(
    @Inject(MENSAJE_REPOSITORY)
    private readonly mensajeRepository: IMensajeRepository,
    // Se comunica con el service de Publicaciones, nunca con su repositorio directo
    private readonly publicacionesService: PublicacionesService,
    private readonly usuariosService: UsuariosService,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailService,
  ) {}

  /**
   * Envía un mensaje. No hace falta crear un "chat" antes: la conversación
   * queda implícitamente definida por (publicacion, origen, destino) apenas
   * se guarda el primer mensaje.
   */
  async enviar(dto: EnviarMensajeDto, idUsuarioOrigen: number): Promise<Mensaje> {
    if (idUsuarioOrigen === dto.id_destino_usuario) {
      throw new BadRequestException('No podés enviarte un mensaje a vos mismo');
    }

    // El destino debe ser el anunciante dueño de la publicacion; de ese modo
    // el endpoint no permite iniciar conversaciones arbitrarias entre usuarios.
    const publicacion = await this.publicacionesService.buscarPorId(dto.id_publicacion);

    const idAnunciante = publicacion.anunciante.usuario.id;
    if (idAnunciante !== dto.id_destino_usuario) {
      // Única excepción: el anunciante respondiendo a alguien que ya le escribió
      // por esta publicación. Así puede contestar, pero no abrir chats arbitrarios.
      const esRespuestaDelAnunciante =
        idUsuarioOrigen === idAnunciante &&
        (
          await this.mensajeRepository.buscarConversacion(
            dto.id_publicacion,
            idUsuarioOrigen,
            dto.id_destino_usuario,
          )
        ).length > 0;

      if (!esRespuestaDelAnunciante) {
        throw new ForbiddenException('El destinatario no es el anunciante de esta publicación');
      }
    }

    const mensaje = this.mensajeRepository.crear({
      texto: dto.texto,
      fecha: new Date(),
      leido: false,
      fecha_lectura: null,
      origenUsuario: { id: idUsuarioOrigen } as any,
      destinoUsuario: { id: dto.id_destino_usuario } as any,
      publicacion: { id: dto.id_publicacion } as any,
    });

    const guardado = await this.mensajeRepository.guardar(mensaje);
    const [destinatario, remitente] = await Promise.all([
      this.usuariosService.buscarPorId(dto.id_destino_usuario),
      this.usuariosService.buscarPorId(idUsuarioOrigen),
    ]);
    if (destinatario && remitente) {
      try {
        await this.mailService.enviarMensajeNuevo(destinatario.email, `${remitente.nombre} ${remitente.apellido}`.trim(), publicacion.titulo);
      } catch (error) {
        this.logger.error(`No se pudo enviar el aviso de chat a ${destinatario.email}`, error as Error);
      }
    }
    return guardado;
  }

  /**
   * Devuelve todos los mensajes de una conversación puntual, validando
   * que quien pide sea uno de los dos participantes.
   */
  async listarConversacion(
    idPublicacion: number,
    idOtroUsuario: number,
    idUsuarioActual: number,
  ): Promise<Mensaje[]> {
    // El repositorio busca ambos sentidos del intercambio (A->B y B->A).
    const mensajes = await this.mensajeRepository.buscarConversacion(
      idPublicacion,
      idUsuarioActual,
      idOtroUsuario,
    );

    if (mensajes.length === 0) return mensajes;

    const esParticipante = mensajes.some(
      (m) => m.origenUsuario.id === idUsuarioActual || m.destinoUsuario.id === idUsuarioActual,
    );

    if (!esParticipante) {
      throw new ForbiddenException('No formás parte de esta conversación');
    }

    return mensajes;
  }

  /**
   * Arma la "bandeja de entrada" del usuario: una fila por cada conversación
   * distinta (publicación + interlocutor), mostrando el último mensaje.
   * Se resuelve en memoria aprovechando que buscarPorUsuario ya viene
   * ordenado DESC por fecha.
   */
  async listarConversaciones(idUsuario: number): Promise<ConversacionResumen[]> {
    const mensajes = await this.mensajeRepository.buscarPorUsuario(idUsuario);

    // La consulta llega ordenada del mensaje mas nuevo al mas viejo. El Map
    // conserva solamente el primero de cada par publicacion-interlocutor.
    const conversaciones = new Map<string, ConversacionResumen>();

    // Como la consulta está ordenada DESC, el primer mensaje de cada clave es el último real.
    for (const mensaje of mensajes) {
      const idOtroUsuario =
        mensaje.origenUsuario.id === idUsuario ? mensaje.destinoUsuario.id : mensaje.origenUsuario.id;

      const clave = `${mensaje.publicacion.id}-${idOtroUsuario}`;

      // La clave combina publicación e interlocutor para separar chats del mismo usuario.
      if (!conversaciones.has(clave)) {
        conversaciones.set(clave, {
          idPublicacion: mensaje.publicacion.id,
          idOtroUsuario,
          ultimoMensaje: mensaje,
          cantidadNoLeidos: 0,
        });
      }
      if (mensaje.destinoUsuario.id === idUsuario && !mensaje.leido) {
        conversaciones.get(clave)!.cantidadNoLeidos += 1;
      }
    }

    return Array.from(conversaciones.values());
  }

  /** Marca como leídos solamente los mensajes que el usuario recibió en este chat. */
  async marcarConversacionComoLeida(idPublicacion: number, idOtroUsuario: number, idUsuarioActual: number): Promise<void> {
    await this.mensajeRepository.marcarConversacionComoLeida(idPublicacion, idOtroUsuario, idUsuarioActual);
  }
}
