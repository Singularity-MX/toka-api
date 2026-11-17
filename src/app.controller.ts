import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check de la API' })
  @ApiResponse({ status: 200, description: 'La API está viva.', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}