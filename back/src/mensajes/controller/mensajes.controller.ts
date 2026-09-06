// mensajes/controlador/mensajes.controller.ts
import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { MensajesService } from '../service/mensajes.service';
import { EnviarMensajeDto } from '../dto/enviar-mensaje.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  // El remitente se toma del JWT, nunca del body enviado por el cliente.
  enviar(@Body() dto: EnviarMensajeDto, @Req() req: any) {
    return this.mensajesService.enviar(dto, req.user.id);
  }

  // Bandeja de entrada: lista de conversaciones del usuario logueado
  @Get()
  // La bandeja se calcula exclusivamente para el usuario autenticado.
  listarConversaciones(@Req() req: any) {
    return this.mensajesService.listarConversaciones(req.user.id);
  }

  // Mensajes de una conversación puntual: publicación X con el usuario Y
  @Get('publicacion/:idPublicacion/usuario/:idOtroUsuario')
  listarConversacion(
    @Param('idPublicacion', ParseIntPipe) idPublicacion: number,
    @Param('idOtroUsuario', ParseIntPipe) idOtroUsuario: number,
    @Req() req: any,
  ) {
    return this.mensajesService.listarConversacion(idPublicacion, idOtroUsuario, req.user.id);
  }
}