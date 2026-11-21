import type { AuthenticatedRequest } from '../../seguridad/guards/jwt-auth.guard';
// mensajes/controlador/mensajes.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MensajesService } from '../service/mensajes.service';
import { EnviarMensajeDto } from '../dto/enviar-mensaje.dto';
import { JwtAuthGuard, PermitirAccesoLimitado } from '../../seguridad/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @PermitirAccesoLimitado()
  @Post()
  // El remitente se toma del JWT, nunca del body enviado por el cliente.
  enviar(@Body() dto: EnviarMensajeDto, @Req() req: AuthenticatedRequest) {
    return this.mensajesService.enviar(dto, req.user.id);
  }

  // Bandeja de entrada: lista de conversaciones del usuario logueado
  @PermitirAccesoLimitado()
  @Get()
  // La bandeja se calcula exclusivamente para el usuario autenticado.
  listarConversaciones(@Req() req: AuthenticatedRequest) {
    return this.mensajesService.listarConversaciones(req.user.id);
  }

  // Mensajes de una conversación puntual: publicación X con el usuario Y
  @PermitirAccesoLimitado()
  @Get('publicacion/:idPublicacion/usuario/:idOtroUsuario')
  listarConversacion(@Param('idPublicacion', ParseIntPipe) idPublicacion: number, @Param('idOtroUsuario', ParseIntPipe) idOtroUsuario: number, @Req() req: AuthenticatedRequest) {
    return this.mensajesService.listarConversacion(
      idPublicacion,
      idOtroUsuario,
      req.user.id,
    );
  }

  @PermitirAccesoLimitado()
  @Patch('publicacion/:idPublicacion/usuario/:idOtroUsuario/leer')
  marcarComoLeida(@Param('idPublicacion', ParseIntPipe) idPublicacion: number, @Param('idOtroUsuario', ParseIntPipe) idOtroUsuario: number, @Req() req: AuthenticatedRequest) {
    return this.mensajesService.marcarConversacionComoLeida(
      idPublicacion,
      idOtroUsuario,
      req.user.id,
    );
  }
}
