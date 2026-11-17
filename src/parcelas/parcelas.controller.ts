import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { ParcelStatus } from '../generated/prisma/client'
import { ParcelasService } from './parcelas.service'
import { CreateParcelDto } from './dto/create-parcel.dto'
import { UpdateParcelDto } from './dto/update-parcel.dto'
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto'
import { ParcelResponseDto } from './dto/parcel-response.dto'

@ApiTags('parcelas')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('parcels')
export class ParcelasController {
  constructor(private readonly parcelasService: ParcelasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una parcela con su polígono GeoJSON' })
  @ApiResponse({ status: 201, type: ParcelResponseDto })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  create(
    @Req() req: any,
    @Body() dto: CreateParcelDto,
  ): Promise<ParcelResponseDto> {
    return this.parcelasService.create(req.user.id, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar las parcelas del usuario autenticado' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ParcelStatus,
    description: 'Filtrar por estado (ACTIVE, FALLOW, INACTIVE, ARCHIVED)',
  })
  @ApiResponse({ status: 200, type: ParcelResponseDto, isArray: true })
  findAll(
    @Req() req: any,
    @Query('status') status?: ParcelStatus,
  ): Promise<ParcelResponseDto[]> {
    return this.parcelasService.findAllByUser(req.user.id, status)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una parcela por ID' })
  @ApiResponse({ status: 200, type: ParcelResponseDto })
  @ApiResponse({ status: 403, description: 'La parcela pertenece a otro usuario' })
  @ApiResponse({ status: 404, description: 'Parcela no encontrada' })
  findOne(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<ParcelResponseDto> {
    return this.parcelasService.findOne(req.user.id, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre, polígono y/o estado' })
  @ApiResponse({ status: 200, type: ParcelResponseDto })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateParcelDto,
  ): Promise<ParcelResponseDto> {
    return this.parcelasService.update(req.user.id, id, dto)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar solo el estado de la parcela (toggle)' })
  @ApiResponse({ status: 200, type: ParcelResponseDto })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateParcelStatusDto,
  ): Promise<ParcelResponseDto> {
    return this.parcelasService.updateStatus(req.user.id, id, dto.status)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una parcela' })
  @ApiResponse({ status: 200, type: ParcelResponseDto })
  remove(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<ParcelResponseDto> {
    return this.parcelasService.remove(req.user.id, id)
  }
}