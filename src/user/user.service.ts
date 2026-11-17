import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateUserConfigDto } from './dto/update-user-config.dto'
import type { UserConfigResponseDto } from './dto/user-config-response.dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async saveConfig(
    userId: string,
    dto: UpdateUserConfigDto,
  ): Promise<UserConfigResponseDto> {
    const completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date()

    // Resolver rotationPlan una sola vez:
    //   undefined → no tocar
    //   null      → poner NULL en la DB
    //   object    → guardar el objeto
    const rotationPlanValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined =
      dto.rotationPlan === undefined
        ? undefined
        : dto.rotationPlan === null
          ? Prisma.JsonNull
          : (dto.rotationPlan as Prisma.InputJsonValue)

    const updated = await this.prisma.$transaction(async (tx) => {
      const exists = await tx.user.findUnique({ where: { id: userId } })
      if (!exists) throw new NotFoundException('Usuario no encontrado')

      await tx.user.update({
        where: { id: userId },
        data: {
          priorities: dto.priorities,
          rotationPlan: rotationPlanValue,
          configCompletedAt: completedAt,
        },
      })

      await tx.rotation.deleteMany({ where: { userId } })

      if (dto.rotations.length > 0) {
        await tx.rotation.createMany({
          data: dto.rotations.map((r) => ({
            userId,
            parcel: r.parcel,
            previousCrop: r.previousCrop,
            currentCrop: r.currentCrop,
            nextCrop: r.nextCrop,
          })),
        })
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          priorities: true,
          rotationPlan: true,
          configCompletedAt: true,
          rotations: {
            select: {
              id: true,
              parcel: true,
              previousCrop: true,
              currentCrop: true,
              nextCrop: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    })

    if (!updated) {
      // Imposible en teoría, pero TypeScript lo pide
      throw new NotFoundException('Usuario no encontrado tras guardar')
    }

    return updated
  }

  async getConfig(userId: string): Promise<UserConfigResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        priorities: true,
        rotationPlan: true,
        configCompletedAt: true,
        rotations: {
          select: {
            id: true,
            parcel: true,
            previousCrop: true,
            currentCrop: true,
            nextCrop: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }
}