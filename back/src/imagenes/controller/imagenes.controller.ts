import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from '../service/imagenes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnuncianteGuard } from '../../common/guards/anunciante.guard';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Post('publicacion/:idPublicacion')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  @UseInterceptors(
    FileInterceptor('archivo', {
      // El límite se aplica al archivo original antes de que Sharp lo comprima.
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máx antes de comprimir
      fileFilter: (req, file, callback) => {
        // Validar MIME temprano evita procesar o almacenar formatos no soportados.
        if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WEBP, HEIC)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  // AnuncianteGuard agrega req.anunciante después de comprobar que el usuario es propietario.
  async subir(
    @Param('idPublicacion', ParseIntPipe) idPublicacion: number,
    @UploadedFile() archivo: ArchivoSubido,
    @Req() req: any,
  ) {
    if (!archivo) throw new BadRequestException('No se envió ningún archivo');
    return this.imagenesService.subir(idPublicacion, req.anunciante, archivo);
  }

  @Get('publicacion/:idPublicacion')
  async listarPorPublicacion(@Param('idPublicacion', ParseIntPipe) idPublicacion: number) {
    return this.imagenesService.listarPorPublicacion(idPublicacion);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AnuncianteGuard)
  async eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.imagenesService.eliminar(id, req.anunciante);
  }
}