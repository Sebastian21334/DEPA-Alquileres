import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../seguridad/guards/jwt-auth.guard';
import { ActualizarResenaDto } from '../dto/actualizar-resena.dto';
import { DenunciarResenaDto } from '../dto/denunciar-resena.dto';
import {
  MAX_BYTES_IMAGEN_RESENA,
  TIPOS_IMAGEN_RESENA,
} from '../resenas.constants';
import { ResenasImagenesService } from '../service/resenas-imagenes.service';
import { ResenasService } from '../service/resenas.service';

/** Operaciones sobre una reseña existente: editar, borrar e imágenes. */
@Controller('resenas')
export class ResenasController {
  constructor(
    private readonly resenasService: ResenasService,
    private readonly resenasImagenesService: ResenasImagenesService,
  ) {}

  @Get('recibidas-por-reserva')
  @UseGuards(JwtAuthGuard)
  estadosRecibidosPorReserva(@Req() req: AuthenticatedRequest) {
    return this.resenasService.estadosRecibidosPorReserva(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.actualizar(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.eliminar(id, req.user.id);
  }

  @Post(':id/denunciar')
  @UseGuards(JwtAuthGuard)
  denunciar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DenunciarResenaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasService.denunciar(id, req.user.id, dto);
  }

  @Post(':id/imagenes')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('archivo', {
      limits: { fileSize: MAX_BYTES_IMAGEN_RESENA },
      fileFilter: (_req, file, callback) => {
        if (!TIPOS_IMAGEN_RESENA.some((tipo) => tipo === file.mimetype)) {
          return callback(
            new BadRequestException('Solo se permiten imágenes JPEG, PNG, WEBP o HEIC.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  subirImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: Express.Multer.File | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasImagenesService.agregar(id, req.user.id, archivo);
  }

  @Delete(':id/imagenes/:idImagen')
  @UseGuards(JwtAuthGuard)
  eliminarImagen(
    @Param('id', ParseIntPipe) id: number,
    @Param('idImagen', ParseIntPipe) idImagen: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.resenasImagenesService.eliminar(id, idImagen, req.user.id);
  }
}
