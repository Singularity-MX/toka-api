import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req
    const userAgent = req.get('user-agent') ?? '-'
    const start = Date.now()

    // Se ejecuta cuando la response termina (éxito o error)
    res.on('finish', () => {
      const ms = Date.now() - start
      const status = res.statusCode
      const msg = `${method} ${originalUrl} → ${status} · ${ms}ms · ${ip} · ${userAgent}`

      if (status >= 500) {
        this.logger.error(msg)
      } else if (status >= 400) {
        this.logger.warn(msg)
      } else {
        this.logger.log(msg)
      }
    })

    // Se ejecuta si el cliente corta la conexión antes de terminar
    res.on('close', () => {
      if (!res.writableEnded) {
        this.logger.warn(`${method} ${originalUrl} → cliente desconectó`)
      }
    })

    next()
  }
}