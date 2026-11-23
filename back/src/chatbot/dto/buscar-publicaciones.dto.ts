import { ArrayMaxSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const MODALIDADES = ['temporales', 'largo-plazo'] as const;
const AMBIENTES = ['1', '2', '3', '4+'] as const;
const MONEDAS = ['ARS', 'USD'] as const;

export class BuscarPublicacionesDto {
  @IsOptional()
  @IsIn(MODALIDADES)
  modalidad?: typeof MODALIDADES[number];

  @IsOptional()
  @IsString()
  @Matches(/\S/u)
  @MaxLength(100)
  ciudad?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/u)
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(AMBIENTES, { each: true })
  ambientes?: string[];

  @IsOptional()
  @IsIn(MONEDAS)
  moneda?: typeof MONEDAS[number];

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  superficieMin?: number;
}

export const DEFINICION_BUSCAR_PUBLICACIONES = {
  type: 'function',
  function: {
    name: 'buscarPublicaciones',
    description: 'Consulta el catálogo público de DEPA y devuelve hasta cinco publicaciones. Usá solo los criterios pedidos por el usuario.',
    strict: false,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        modalidad: { type: 'string', enum: [...MODALIDADES] },
        ciudad: { type: 'string', maxLength: 100, description: 'Nombre de la localidad, sin agregar la provincia.' },
        q: { type: 'string', maxLength: 200, description: 'Palabras clave del catálogo, como tipo de propiedad o provincia. No copiar toda la conversación.' },
        ambientes: { type: 'array', maxItems: 4, items: { type: 'string', enum: [...AMBIENTES] } },
        moneda: { type: 'string', enum: [...MONEDAS], description: 'Moneda indicada por el usuario.' },
        precioMin: { type: 'number', minimum: 0 },
        precioMax: { type: 'number', minimum: 0 },
        superficieMin: { type: 'number', minimum: 0, description: 'Superficie mínima en metros cuadrados.' },
      },
    },
  },
} as const;
