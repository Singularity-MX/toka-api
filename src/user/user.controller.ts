import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '../auth/auth.guard'
import { UserService } from './user.service'
import { UpdateUserConfigDto } from './dto/update-user-config.dto'
import { UserConfigResponseDto } from './dto/user-config-response.dto'

@ApiTags('user')
@ApiBearerAuth('firebase-auth')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('config')
  @ApiOperation({
    summary: 'Guardar la configuración inicial del usuario',
    description:
      'Guarda prioridades, rotaciones y plan. El userId se toma del token, NO del body.',
  })
  @ApiResponse({ status: 201, type: UserConfigResponseDto })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  saveConfig(
    @Req() req: any,
    @Body() dto: UpdateUserConfigDto,
  ): Promise<UserConfigResponseDto> {
    return this.userService.saveConfig(req.user.id, dto)
  }

  @Get('config')
  @ApiOperation({ summary: 'Obtener la configuración actual del usuario' })
  @ApiResponse({ status: 200, type: UserConfigResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getConfig(@Req() req: any): Promise<UserConfigResponseDto> {
    return this.userService.getConfig(req.user.id)
  }
}