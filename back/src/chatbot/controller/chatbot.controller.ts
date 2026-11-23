import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConsultarChatbotDto } from '../dto/consultar-chatbot.dto';
import { ChatbotService, type RespuestaChatbot } from '../service/chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  consultar(@Body() dto: ConsultarChatbotDto): Promise<RespuestaChatbot> {
    return this.chatbot.consultar(dto.mensajes);
  }
}
