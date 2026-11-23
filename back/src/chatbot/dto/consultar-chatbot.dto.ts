import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsObject, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';

export class MensajeChatbotDto {
  @IsIn(['user', 'assistant'])
  rol: 'user' | 'assistant';

  @IsString()
  @Matches(/\S/u, { message: 'El mensaje debe incluir texto.' })
  @MaxLength(500)
  contenido: string;
}

export class ConsultarChatbotDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => MensajeChatbotDto)
  mensajes: MensajeChatbotDto[];
}
