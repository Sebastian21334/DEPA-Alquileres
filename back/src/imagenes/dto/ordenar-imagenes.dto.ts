import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class OrdenarImagenesDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}
