import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name)

  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) return

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.getOrThrow('FIREBASE_PROJECT_ID'),
        clientEmail: this.config.getOrThrow('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.config
          .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      }),
    })

    this.logger.log('Firebase Admin inicializado correctamente')
  }

  async verifyIdToken(token: string) {
    return admin.auth().verifyIdToken(token)
  }
}