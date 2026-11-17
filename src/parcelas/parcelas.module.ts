import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ParcelasController } from './parcelas.controller'
import { ParcelasService } from './parcelas.service'

@Module({
  imports: [AuthModule],
  controllers: [ParcelasController],
  providers: [ParcelasService],
})
export class ParcelasModule {}