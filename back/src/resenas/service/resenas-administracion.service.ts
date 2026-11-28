import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MAIL_SERVICE, type IMailResenas, type ObjetivoResenaEmail } from '../../mail/mail.interface';
import {
  ESTADOS_RESENAS_ADMINISTRACION,
  type EstadoResenasAdministracion,
  type ListarResenasAdministracionDto,
} from '../dto/listar-resenas-administracion.dto';
import type {
  PaginaResenasAdministracionDto,
  ResenaAdministracionDto,
  ResolucionDenunciaResenaDto,
} from '../dto/resena-respuesta.dto';
import type { ModerarResenaDto } from '../dto/moderar-resena.dto';
import type { ResolverDenunciaDto } from '../dto/resolver-denuncia.dto';
import {
  objetivoDeResena,
  prepararResenaAdministracion,
} from '../presentacion/resena-presentacion';
import {
  RESENA_REPOSITORY,
  type FiltroResenasAdministracion,
  type IResenaRepository,
} from '../repository/resena.repository.interface';
import {
  MAX_CARACTERES_MOTIVO_MODERACION,
  MIN_CARACTERES_MOTIVO_MODERACION,
} from '../resenas.constants';
import type { Resena } from '../entity/resena.entity';
import { ResenasResumenService } from './resenas-resumen.service';

type AccionModeracion = 'ocultar' | 'restaurar' | 'aceptarDenuncia' | 'rechazarDenuncia';

const FILTROS_ADMINISTRACION = {
  [ESTADOS_RESENAS_ADMINISTRACION.VISIBLES]: { visible: true },
  [ESTADOS_RESENAS_ADMINISTRACION.OCULTAS]: { visible: false },
  [ESTADOS_RESENAS_ADMINISTRACION.DENUNCIADAS]: { denunciada: true },
  [ESTADOS_RESENAS_ADMINISTRACION.TODAS]: {},
} satisfies Record<EstadoResenasAdministracion, FiltroResenasAdministracion>;

@Injectable()
export class ResenasAdministracionService {
  private readonly logger = new Logger(ResenasAdministracionService.name);

  constructor(
    @Inject(RESENA_REPOSITORY) private readonly resenasRepo: IResenaRepository,
    private readonly resumenService: ResenasResumenService,
    @Inject(MAIL_SERVICE) private readonly mailService: IMailResenas,
  ) {}

  async historialDenuncias(): Promise<ResolucionDenunciaResenaDto[]> {
    const historial = await this.resenasRepo.historialDenuncias();
    return historial.map((resolucion) => ({
      id: resolucion.id,
      id_resena: resolucion.id_resena,
      motivo_denuncia: resolucion.motivo_denuncia,
      fecha_denuncia: resolucion.fecha_denuncia,
      aceptada: resolucion.aceptada,
      motivo_resolucion: resolucion.motivo_resolucion,
      fecha_resolucion: resolucion.fecha_resolucion,
      id_administrador: resolucion.id_administrador,
      administrador_nombre: resolucion.administrador_nombre,
      administrador_apellido: resolucion.administrador_apellido,
    }));
  }

  async resolverDenuncia(idResena: number, idAdministrador: number, dto: ResolverDenunciaDto): Promise<ResenaAdministracionDto> {
    const motivo = dto.motivo.trim();
    if (motivo.length < MIN_CARACTERES_MOTIVO_MODERACION || motivo.length > MAX_CARACTERES_MOTIVO_MODERACION) {
      throw new BadRequestException(`Indicá un motivo de entre ${MIN_CARACTERES_MOTIVO_MODERACION} y ${MAX_CARACTERES_MOTIVO_MODERACION} caracteres.`);
    }
    return this.aplicarModeracion(idResena, idAdministrador, dto.aceptada ? 'aceptarDenuncia' : 'rechazarDenuncia', motivo);
  }

  quitarDenuncia(idResena: number, idAdministrador: number): Promise<ResenaAdministracionDto> {
    return this.aplicarModeracion(idResena, idAdministrador, 'rechazarDenuncia', 'Denuncia desestimada por administración.');
  }

  async listarAdministracion(dto: ListarResenasAdministracionDto): Promise<PaginaResenasAdministracionDto> {
    const texto = dto.q?.trim() ?? '';
    let idResena: number | undefined;
    if (texto) {
      const numero = Number(texto);
      if (!Number.isSafeInteger(numero) || numero < 1) {
        return { datos: [], pagina: 1, limite: dto.limite, total: 0, totalPaginas: 1 };
      }
      idResena = numero;
    }
    const pagina = await this.resenasRepo.listarAdministracion(
      dto.pagina,
      dto.limite,
      FILTROS_ADMINISTRACION[dto.estado],
      idResena,
    );
    return {
      ...pagina,
      datos: pagina.datos.map(prepararResenaAdministracion),
    };
  }

  async moderar(idResena: number, idAdministrador: number, dto: ModerarResenaDto): Promise<ResenaAdministracionDto> {
    if (dto.motivo !== undefined && typeof dto.motivo !== 'string') {
      throw new BadRequestException('El motivo debe ser un texto.');
    }
    const motivo = dto.motivo?.trim() ?? '';
    if (!dto.visible && motivo.length < MIN_CARACTERES_MOTIVO_MODERACION) {
      throw new BadRequestException(
        `Indicá un motivo de al menos ${MIN_CARACTERES_MOTIVO_MODERACION} caracteres para ocultar la reseña.`,
      );
    }
    return this.aplicarModeracion(idResena, idAdministrador, dto.visible ? 'restaurar' : 'ocultar', motivo);
  }

  private async aplicarModeracion(idResena: number, idAdministrador: number, accion: AccionModeracion, motivo: string): Promise<ResenaAdministracionDto> {
    const { respuesta, aviso } = await this.resenasRepo.conTransaccion(async (repositorio, transaccion) => {
      const resena = await repositorio.buscarParaModerar(idResena);
      if (!resena) throw new NotFoundException('Reseña no encontrada');

      const rechazar = accion === 'rechazarDenuncia';
      const resolver = rechazar || accion === 'aceptarDenuncia' || (accion === 'ocultar' && resena.denunciada);
      if (resolver) {
        if (!resena.denunciada) throw new ConflictException('La denuncia ya fue resuelta o no existe.');
        await repositorio.registrarResolucionDenuncia(idResena, { idAdministrador, aceptada: !rechazar, motivo });
      }

      const visible = accion === 'restaurar';
      const objetivo = rechazar ? null : objetivoDeResena(resena);
      if (objetivo) {
        await repositorio.registrarModeracion(idResena, {
          visible,
          motivo: visible ? null : motivo,
          idAdministrador: visible ? null : idAdministrador,
          fecha: visible ? null : new Date(),
        });
        await this.resumenService.recalcular(objetivo, { repositorio, transaccion });
      }

      const actual = await repositorio.buscarPorId(idResena);
      if (!actual) throw new NotFoundException('Reseña no encontrada');
      return {
        respuesta: prepararResenaAdministracion(actual),
        aviso: objetivo && resena.visible && !visible ? { resena, objetivo } : null,
      };
    });
    if (aviso) await this.avisarAutor(aviso.resena, aviso.objetivo, motivo);
    return respuesta;
  }

  /** La moderación ya quedó guardada: un fallo del correo se registra y no la revierte. */
  private async avisarAutor(resena: Resena, objetivo: ObjetivoResenaEmail, motivo: string): Promise<void> {
    const email = resena.autor.email;
    if (!email) return;
    try {
      await this.mailService.enviarResenaOcultada(email, objetivo, motivo);
    } catch (error) {
      this.logger.error(`No se pudo avisar al autor que se ocultó la reseña ${resena.id}`, error as Error);
    }
  }
}
