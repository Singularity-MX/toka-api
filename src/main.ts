
import { NestFactory } from '@nestjs/core'
import {
  ValidationPipe,
  Logger,
  VersioningType,
} from '@nestjs/common'

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'


async function bootstrap() {

  const isProd = process.env.NODE_ENV === 'production'

  // ==========================================
  // APPLICATION
  // ==========================================

  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  })


  // ==========================================
  // API VERSIONING
  // ==========================================

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })


  // ==========================================
  // CORS
  // ==========================================

  const allowedOrigins = (
    process.env.FRONTEND_URL ?? 'http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim())

  app.enableCors({
    origin: (origin, callback) => {

      // Allow requests without origin (curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(
        new Error(`Origen no permitido por CORS: ${origin}`),
        false,
      )
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],

    exposedHeaders: [
      'Content-Length',
      'X-Request-Id',
    ],

    maxAge: 86400,
  })


  // ==========================================
  // GLOBAL VALIDATION
  // ==========================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )


  // ==========================================
  // GLOBAL EXCEPTION FILTER
  // ==========================================

  app.useGlobalFilters(
    new AllExceptionsFilter(),
  )


  // ==========================================
  // SWAGGER CONFIGURATION
  // ==========================================

  const config = new DocumentBuilder()
    .setTitle('Toka API')
    .setDescription(
      'API para la herramienta de rotación de cultivos Toka',
    )
    .setVersion('1.0')

    .addTag(
      'app',
      'Endpoints base de la aplicación',
    )

    .addTag(
      'auth',
      'Autenticación con Firebase y Google',
    )

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase ID Token (obtenido tras el login con Google)',
      },
      'firebase-auth',
    )
    .addTag('user', 'Configuración y perfil del agricultor')
    .addTag('parcelas', 'Gestión de parcelas con polígonos GeoJSON')

    // Base URL through Nginx
    //.addServer('/toka-api')

    .build()


  const document = SwaggerModule.createDocument(
    app,
    config,
  )


  // Swagger UI
  SwaggerModule.setup(
    'v1/api/docs',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    },
  )


  // ==========================================
  // SERVER
  // ==========================================

  const port = process.env.PORT ?? 8000

  await app.listen(port, '0.0.0.0')


  // ==========================================
  // LOGGING
  // ==========================================

  const logger = new Logger('Bootstrap')

  logger.log(`Toka API corriendo en: http://localhost:${port}`)
  logger.log(`API v1:                 http://localhost:${port}/v1`)
  logger.log(`Swagger docs:           http://localhost:${port}/v1/api/docs`)
  logger.log(`Swagger vía Nginx:      http://localhost/toka-api/v1/api/docs`)
  logger.log(`CORS permitido para:    ${allowedOrigins.join(', ')}`)
}

bootstrap()
