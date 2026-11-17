import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { FirebaseService } from './firebase.service'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name)  // 👈 logger con contexto "AuthGuard"

  constructor(
    private readonly firebase: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const header: string | undefined = req.headers.authorization

    if (!header?.startsWith('Bearer ')) {
      this.logger.warn(`Token faltante · ${req.method} ${req.url}`)
      throw new UnauthorizedException('Token de autorización faltante')
    }

    const token = header.slice(7).trim()

    let decoded: any
    try {
      decoded = await this.firebase.verifyIdToken(token)
    } catch (err) {
      this.logger.warn(`Token inválido o expirado · ${req.method} ${req.url}`)
      throw new UnauthorizedException('Token inválido o expirado')
    }

    // 🔍 ¿Nueva cuenta o login recurrente?
    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    })
    const isNewUser = !existingUser

    // 🧾 Log estructurado (se ve bien en terminal)
    if (isNewUser) {
      this.logger.log(`🆕 NUEVA CUENTA  ${decoded.email}  (${decoded.firebase?.sign_in_provider ?? 'google'})`)
    } else {
      this.logger.log(`🔑 LOGIN  ${decoded.email}`)
    }

    // 💾 Upsert
    const user = await this.prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email!,
        nombre: decoded.name ?? null,
        photoURL: decoded.picture ?? null,
        provider: decoded.firebase?.sign_in_provider ?? 'google',
      },
      update: {
        email: decoded.email!,
        nombre: decoded.name ?? null,
        photoURL: decoded.picture ?? null,
      },
    })

    req.user = user
    req.isNewUser = isNewUser
    return true
  }
}