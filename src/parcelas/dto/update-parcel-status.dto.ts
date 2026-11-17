import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ParcelStatus } from '../../generated/prisma/client'

export class UpdateParcelStatusDto {
  /** Nuevo estado de la parcela */
  @ApiProperty({
    enum: ParcelStatus,
    example: ParcelStatus.INACTIVE,
    description: 'Estado nuevo al que se quiere mover la parcela',
  })
  @IsEnum(ParcelStatus)
  status: ParcelStatus
}