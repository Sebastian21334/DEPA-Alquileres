import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ListarResenasAdministracionDto } from '../dto/listar-resenas-administracion.dto';
import type {
  PaginaResenasAdministracionDto,
  ResenaAdministracionDto,
} from '../dto/resena-respuesta.dto';
import type { ModerarResenaDto } from '../dto/moderar-resena.dto';
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
  MIN_CARACTERES_MOTIVO_MODERACION,
  type EstadoResenasAdministracion,
} from '../resenas.constants';
import { ResenasResumenService } from './resenas-resumen.service';

@Injectable()
export class ResenasAdministracionService {
  constructor(
    @Inject(RESENA_REPOSITORY) private readonly resenasRepo: IResenaRepository,
    private readonly resumenService: ResenasResumenService,
  ) {}

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
      this.filtro(dto.estado),
      idResena,
    );
    return {
      ...pagina,
      datos: pagina.datos.map(prepararResenaAdministracion),
    };
  }

  async moderar(idResena: number, idAdministrador: number, dto: ModerarResenaDto): Promise<ResenaAdministracionDto> {
    const resena = await this.resenasRepo.buscarPorId(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (dto.motivo !== undefined && typeof dto.motivo !== 'string') {
      throw new BadRequestException('El motivo debe ser un texto.');
    }
    const motivo = dto.motivo?.trim() ?? '';
    if (!dto.visible && motivo.length < MIN_CARACTERES_MOTIVO_MODERACION) {
      throw new BadRequestException(
        `Indicá un motivo de al menos ${MIN_CARACTERES_MOTIVO_MODERACION} caracteres para ocultar la reseña.`,
      );
    }
    await this.resenasRepo.registrarModeracion(idResena, {
      visible: dto.visible,
      motivo: dto.visible ? null : motivo,
      idAdministrador: dto.visible ? null : idAdministrador,
      fecha: dto.visible ? null : new Date(),
    });
    const objetivo = objetivoDeResena(resena);
    await this.resumenService.recalcular({ tipo: objetivo.tipo, id: objetivo.id });
    return prepararResenaAdministracion(await this.buscarParaRespuesta(idResena));
  }

  async quitarDenuncia(idResena: number): Promise<ResenaAdministracionDto> {
    const resena = await this.resenasRepo.buscarPorId(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    await this.resenasRepo.quitarDenuncia(idResena);
    return prepararResenaAdministracion(await this.buscarParaRespuesta(idResena));
  }

  private filtro(estado: EstadoResenasAdministracion): FiltroResenasAdministracion {
    switch (estado) {
      case 'visibles':
        return { visible: true };
      case 'ocultas':
        return { visible: false };
      case 'denunciadas':
        return { denunciada: true };
      case 'todas':
        return {};
    }
  }

  private async buscarParaRespuesta(idResena: number) {
    const resena = await this.resenasRepo.buscarPorId(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    return resena;
  }
}
