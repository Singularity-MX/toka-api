import type { Prisma } from '../../generated/prisma/client'

export class RotationResponseDto {
  /** ID de la rotación */
  id: string

  /** Nombre de la parcela */
  parcel: string

  /** Cultivo anterior */
  previousCrop: string

  /** Cultivo actual */
  currentCrop: string

  /** Cultivo siguiente */
  nextCrop: string
}

export class UserConfigResponseDto {
  /** ID interno del usuario */
  id: string

  /** Email del usuario */
  email: string

  /** Prioridades seleccionadas */
  priorities: string[]

  /** Plan de rotación (libre) */
  rotationPlan: Prisma.JsonValue | null

  /** Fecha en que completó el onboarding */
  configCompletedAt: Date | null

  /** Rotaciones registradas */
  rotations: RotationResponseDto[]
}