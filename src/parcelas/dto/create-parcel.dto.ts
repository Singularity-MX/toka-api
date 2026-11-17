import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ParcelStatus } from '../../generated/prisma/client'
import { IsPolygon } from '../validators/is-polygon.validator'

export class CreateParcelDto {
  /** Nombre de la parcela (ej. "Parcela 1") */
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string

  /** GeoJSON Polygon del contorno de la parcela */
  @IsPolygon()
  polygon: {
    type: 'Polygon'
    coordinates: number[][][]
  }

  /** Estado de la parcela (por defecto ACTIVE) */
  @IsEnum(ParcelStatus)
  @IsOptional()
  status?: ParcelStatus
}