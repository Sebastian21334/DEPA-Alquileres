import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ActualizarResenaDto } from '../dto/actualizar-resena.dto';
import { CrearResenaDto } from '../dto/crear-resena.dto';
import type { DenunciarResenaDto } from '../dto/denunciar-resena.dto';
import type { ListarResenasDto } from '../dto/listar-resenas.dto';
import type {
  MotivoNoPuedeResenar,
  ResenaPublicaDto,
  ResenasObjetivoDto,
} from '../dto/resena-respuesta.dto';
import type { Resena } from '../entity/resena.entity';
import {
  objetivoDeResena,
  prepararResena,
} from '../presentacion/resena-presentacion';
import {
  RESENA_REPOSITORY,
  type IResenaRepository,
} from '../repository/resena.repository.interface';
import type { ObjetivoResena } from '../resenas.types';
import { ResenasImagenesService } from './resenas-imagenes.service';
import { ResenasResumenService } from './resenas-resumen.service';

interface ObjetivoResuelto extends ObjetivoResena {
  titulo: string;
  idDuenio: number;
}

@Injectable()
export class ResenasService {
  constructor(
    @Inject(RESENA_REPOSITORY) private readonly resenasRepo: IResenaRepository,
    private readonly publicacionesService: PublicacionesService,
    private readonly anunciantesService: AnunciantesService,
    private readonly reservasService: ReservasService,
    private readonly resenasImagenesService: ResenasImagenesService,
    private readonly resumenService: ResenasResumenService,
  ) {}

  async listarPublicacion(idPublicacion: number, idUsuario: number | undefined, dto: ListarResenasDto): Promise<ResenasObjetivoDto> {
    const publicacion = await this.publicacionesService.buscarPublicaPorId(idPublicacion, idUsuario);
    this.validarPublicacionTemporal(publicacion);
    return this.listarObjetivo(this.objetivoDePublicacion(publicacion), idUsuario, dto);
  }

  async listarAnunciante(idAnunciante: number, idUsuario: number | undefined, dto: ListarResenasDto): Promise<ResenasObjetivoDto> {
    const anunciante = await this.buscarAnunciantePublico(idAnunciante);
    return this.listarObjetivo(this.objetivoDeAnunciante(anunciante), idUsuario, dto);
  }

  async crearPublicacion(idPublicacion: number, idUsuario: number, dto: CrearResenaDto): Promise<ResenaPublicaDto> {
    const publicacion = await this.publicacionesService.buscarPublicaPorId(idPublicacion, idUsuario);
    if (publicacion.eliminada) throw new NotFoundException('Publicación no disponible');
    this.validarPublicacionTemporal(publicacion);
    return this.crear(this.objetivoDePublicacion(publicacion), idUsuario, dto);
  }

  async crearAnunciante(idAnunciante: number, idUsuario: number, dto: CrearResenaDto): Promise<ResenaPublicaDto> {
    const anunciante = await this.buscarAnunciantePublico(idAnunciante);
    return this.crear(this.objetivoDeAnunciante(anunciante), idUsuario, dto);
  }

  /** Mismo criterio que el perfil público: anunciante verificado y con la cuenta habilitada. */
  private async buscarAnunciantePublico(idAnunciante: number): Promise<Anunciante> {
    const anunciante = await this.anunciantesService.buscarPorId(idAnunciante);
    if (!anunciante?.verificado || !this.anunciantesService.cuentaHabilitada(anunciante)) {
      throw new NotFoundException('Anunciante no encontrado');
    }
    return anunciante;
  }

  async actualizar(idResena: number, idUsuario: number, dto: ActualizarResenaDto): Promise<ResenaPublicaDto> {
    const resena = await this.buscarPropia(idResena, idUsuario);
    if (!resena.visible) {
      throw new ConflictException('La reseña fue ocultada por moderación y no se puede editar.');
    }
    const guardada = await this.resenasRepo.actualizar(resena, {
      puntaje: dto.puntaje,
      comentario: dto.comentario.trim(),
      actualizada_en: new Date(),
    });
    await this.resumenService.recalcular(objetivoDeResena(guardada));
    return prepararResena(guardada);
  }

  async eliminar(idResena: number, idUsuario: number): Promise<{ id: number }> {
    const resena = await this.buscarPropia(idResena, idUsuario);
    // La reseña oculta conserva la moderación y el lugar del autor: borrarla permitiría publicarla de nuevo.
    if (!resena.visible) {
      throw new ConflictException('La reseña fue ocultada por moderación y no se puede eliminar.');
    }
    const imagenes = resena.imagenes ?? [];
    // Primero se confirma la baja; el storage es una operación best-effort posterior.
    await this.resenasRepo.eliminar(resena);
    await this.resenasImagenesService.eliminarArchivos(imagenes);
    await this.resumenService.recalcular(objetivoDeResena(resena));
    return { id: idResena };
  }

  /** Un usuario autenticado puede marcar una reseña ajena como inapropiada. */
  async denunciar(idResena: number, idUsuario: number, dto: DenunciarResenaDto): Promise<{ id: number; denunciada: boolean }> {
    const resena = await this.resenasRepo.buscarPorId(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (resena.autor.id === idUsuario) {
      throw new ForbiddenException('No podés denunciar tu propia reseña.');
    }
    if (!resena.visible) {
      throw new BadRequestException('La reseña no está disponible para denunciar.');
    }
    // La primera denuncia define el estado; las siguientes son idempotentes.
    if (resena.denunciada) return { id: idResena, denunciada: true };
    await this.resenasRepo.registrarDenuncia(
      idResena,
      idUsuario,
      dto.motivo?.trim() || 'Marcada como inapropiada por un usuario',
      new Date(),
    );
    return { id: idResena, denunciada: true };
  }

  private async listarObjetivo(objetivo: ObjetivoResuelto, idUsuario: number | undefined, dto: ListarResenasDto): Promise<ResenasObjetivoDto> {
    const [pagina, resumen, miResena] = await Promise.all([
      this.resenasRepo.buscarPaginaPorObjetivo(
        objetivo.tipo,
        objetivo.id,
        dto.pagina,
        dto.limite,
        idUsuario,
      ),
      this.resumenService.obtener(objetivo),
      idUsuario
        ? this.resenasRepo.buscarPorObjetivoYAutor(objetivo.tipo, objetivo.id, idUsuario)
        : Promise.resolve(null),
    ]);
    const motivoNoPuede = await this.motivoNoPuedeResenar(objetivo, idUsuario, miResena);
    return {
      objetivo: { tipo: objetivo.tipo, id: objetivo.id, titulo: objetivo.titulo },
      resenas: pagina.datos.map((resena) => prepararResena(resena)),
      total: pagina.total,
      pagina: pagina.pagina,
      limite: pagina.limite,
      totalPaginas: pagina.totalPaginas,
      ...resumen,
      puedeResenar: motivoNoPuede === null,
      ...(motivoNoPuede ? { motivoNoPuede } : {}),
      miResena: miResena ? prepararResena(miResena, true) : null,
    };
  }

  private async crear(objetivo: ObjetivoResuelto, idUsuario: number, dto: CrearResenaDto): Promise<ResenaPublicaDto> {
    if (objetivo.idDuenio === idUsuario) {
      throw new ForbiddenException('No podés reseñar tu propio contenido.');
    }
    if (await this.resenasRepo.buscarPorObjetivoYAutor(objetivo.tipo, objetivo.id, idUsuario)) {
      throw new ConflictException('Ya dejaste una reseña. Podés editarla desde tu reseña publicada.');
    }
    if (!await this.tieneEstadia(objetivo, idUsuario)) {
      throw new ForbiddenException('Solo pueden reseñar quienes completaron una estadía.');
    }
    const datos = {
      puntaje: dto.puntaje,
      comentario: dto.comentario.trim(),
      fecha: new Date(),
      idUsuario,
    };
    const resena = objetivo.tipo === 'PUBLICACION'
      ? this.resenasRepo.crearParaPublicacion({ ...datos, idPublicacion: objetivo.id })
      : this.resenasRepo.crearParaAnunciante({ ...datos, idAnunciante: objetivo.id });
    let guardada: Resena;
    try {
      guardada = await this.resenasRepo.guardar(resena);
    } catch (error) {
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException('Ya dejaste una reseña para este contenido.');
      }
      throw error;
    }
    await this.resumenService.recalcular(objetivo);
    const conRelaciones = await this.resenasRepo.buscarPorId(guardada.id);
    return prepararResena(conRelaciones ?? guardada);
  }

  private async buscarPropia(idResena: number, idUsuario: number): Promise<Resena> {
    const resena = await this.resenasRepo.buscarPorId(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (resena.autor.id !== idUsuario) {
      throw new ForbiddenException('No podés modificar una reseña que no es tuya.');
    }
    return resena;
  }

  private async motivoNoPuedeResenar(objetivo: ObjetivoResuelto, idUsuario: number | undefined, miResena: Resena | null): Promise<MotivoNoPuedeResenar | null> {
    if (!idUsuario) return 'SESION';
    if (objetivo.idDuenio === idUsuario) return 'PROPIO';
    if (miResena) return 'YA_RESENO';
    return await this.tieneEstadia(objetivo, idUsuario) ? null : 'SIN_ESTADIA';
  }

  private tieneEstadia(objetivo: ObjetivoResuelto, idUsuario: number): Promise<boolean> {
    return objetivo.tipo === 'PUBLICACION'
      ? this.reservasService.existeEstadiaFinalizadaEnPublicacion(objetivo.id, idUsuario)
      : this.reservasService.existeEstadiaFinalizadaConAnunciante(objetivo.id, idUsuario);
  }

  private validarPublicacionTemporal(publicacion: Publicacion): void {
    if (!this.publicacionesService.admiteReservaPorFecha(publicacion)) {
      throw new BadRequestException('Las reseñas solo están disponibles para alquileres temporales.');
    }
  }

  private objetivoDePublicacion(publicacion: Publicacion): ObjetivoResuelto {
    if (!publicacion.anunciante) {
      throw new NotFoundException('Publicación no disponible');
    }
    return {
      tipo: 'PUBLICACION',
      id: publicacion.id,
      titulo: publicacion.titulo,
      idDuenio: publicacion.anunciante.idUsuario,
    };
  }

  private objetivoDeAnunciante(anunciante: Anunciante): ObjetivoResuelto {
    return {
      tipo: 'ANUNCIANTE',
      id: anunciante.idUsuario,
      titulo: this.anunciantesService.datosContacto(anunciante).nombre || 'Anunciante',
      idDuenio: anunciante.idUsuario,
    };
  }

}
