import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthGuard } from './auth.guard'
import { FirebaseService } from './firebase.service'

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [FirebaseService, AuthGuard],
  exports: [FirebaseService, AuthGuard],
})
export class AuthModule {}