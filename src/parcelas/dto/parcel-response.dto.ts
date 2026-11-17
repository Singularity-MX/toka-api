import type { ParcelStatus, Prisma } from '../../generated/prisma/client'

export class ParcelResponseDto {
  /** ID interno de la parcela */
  id: string

  /** Nombre de la parcela */
  name: string

  /** GeoJSON Polygon */
  polygon: Prisma.JsonValue

  /** Estado actual de la parcela */
  status: ParcelStatus

  /** Fecha de creación */
  createdAt: Date

  /** Última actualización */
  updatedAt: Date
}