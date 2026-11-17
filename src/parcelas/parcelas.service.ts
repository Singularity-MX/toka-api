import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ParcelStatus, Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateParcelDto } from './dto/create-parcel.dto'
import { UpdateParcelDto } from './dto/update-parcel.dto'
import type { ParcelResponseDto } from './dto/parcel-response.dto'

@Injectable()
export class ParcelasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateParcelDto,
  ): Promise<ParcelResponseDto> {
    return this.prisma.parcel.create({
      data: {
        userId,
        name: dto.name,
        polygon: dto.polygon as unknown as Prisma.InputJsonValue,
        status: dto.status ?? ParcelStatus.ACTIVE,
      },
    })
  }

  /**
   * Lista las parcelas del usuario.
   * @param status filtro opcional por estado (ACTIVE, FALLOW, INACTIVE, ARCHIVED)
   */
  async findAllByUser(
    userId: string,
    status?: ParcelStatus,
  ): Promise<ParcelResponseDto[]> {
    return this.prisma.parcel.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(userId: string, parcelId: string): Promise<ParcelResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
    })
    if (!parcel) throw new NotFoundException('Parcela no encontrada')
    if (parcel.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta parcela')
    }
    return parcel
  }

  async update(
    userId: string,
    parcelId: string,
    dto: UpdateParcelDto,
  ): Promise<ParcelResponseDto> {
    await this.findOne(userId, parcelId)

    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.polygon !== undefined && {
          polygon: dto.polygon as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    })
  }

  /** Atajo para cambiar solo el estado (útil desde la UI con un toggle) */
  async updateStatus(
    userId: string,
    parcelId: string,
    status: ParcelStatus,
  ): Promise<ParcelResponseDto> {
    await this.findOne(userId, parcelId)
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data: { status },
    })
  }

  async remove(userId: string, parcelId: string): Promise<ParcelResponseDto> {
    await this.findOne(userId, parcelId)
    return this.prisma.parcel.delete({ where: { id: parcelId } })
  }
}