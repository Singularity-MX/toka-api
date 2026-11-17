import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard)
  @Post('session')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Crear o sincronizar la sesión del usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado o sesión iniciada correctamente.' })
  @ApiResponse({ status: 401, description: 'Token de Firebase inválido o ausente.' })
  createSession(@Req() req: any) {
    return { user: req.user, isNewUser: req.isNewUser };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth('firebase-auth')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Devuelve el perfil del usuario.' })
  me(@Req() req: any) {
    return req.user;
  }
}