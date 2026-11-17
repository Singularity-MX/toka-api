import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

/** Valores permitidos para las prioridades del agricultor */
// src/user/dto/update-user-config.dto.ts
export const PRIORITIES = [
  'water_reduction',
  'organic_matter',
  'nitrogen_availability',
  'erosion_reduction',
  'forage_value',        // 👈 añadido
  'market_suitability',  // 👈 añadido
  'income',
  'pest_control',
] as const

export type Priority = (typeof PRIORITIES)[number]

export class RotationDto {
  /** Nombre de la parcela (ej. "qqq") */
  @IsString()
  parcel: string

  /** Cultivo del ciclo anterior */
  @IsString()
  previousCrop: string

  /** Cultivo del ciclo actual */
  @IsString()
  currentCrop: string

  /** Cultivo del siguiente ciclo */
  @IsString()
  nextCrop: string
}

export class UpdateUserConfigDto {
  /** Prioridades elegidas por el agricultor */
  @IsArray()
  @IsIn(PRIORITIES, { each: true })
  priorities: Priority[]

  /** Rotaciones asociadas a las parcelas del agricultor */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RotationDto)
  rotations: RotationDto[]

  /** Plan de rotación (formato libre, aún no definido) */
  @IsObject()
  @IsOptional()
  rotationPlan?: Record<string, unknown> | null

  /** ISO date — opcional; si no viene, se usa la fecha del servidor */
  @IsDateString()
  @IsOptional()
  completedAt?: string
}