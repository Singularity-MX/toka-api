// src/auth/auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { AuthGuard } from './auth.guard'
import { FirebaseService } from './firebase.service'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Crea un DecodedIdToken completo con valores por defecto.
 * Solo pasas los campos que te interesan en cada test.
 */
const fakeDecodedToken = (
  overrides: Partial<DecodedIdToken> = {},
): DecodedIdToken => ({
  uid: 'uid-test',
  email: 'test@test.com',
  name: 'Test User',
  aud: 'toka-e8a57',
  auth_time: 0,
  exp: 0,
  iat: 0,
  iss: 'https://securetoken.google.com/toka-e8a57',
  sub: 'uid-test',
  firebase: {
    sign_in_provider: 'google',
    identities: {},
  },
  ...overrides,
})

describe('AuthGuard', () => {
  let guard: AuthGuard
  let mockFirebaseService: DeepMocked<FirebaseService>
  let mockPrismaService: DeepMocked<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseService, useValue: createMock<FirebaseService>() },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
      ],
    }).compile()

    guard = module.get<AuthGuard>(AuthGuard)
    mockFirebaseService = module.get(FirebaseService)
    mockPrismaService = module.get(PrismaService)

    jest.clearAllMocks()
  })

  const mockExecutionContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: { authorization: authHeader },
      method: 'GET',
      url: '/auth/me',
    }
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext
  }

  it('debe lanzar UnauthorizedException si no hay token', async () => {
    const context = mockExecutionContext()

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token de autorización faltante'),
    )
    expect(mockFirebaseService.verifyIdToken).not.toHaveBeenCalled()
  })

  it('debe lanzar UnauthorizedException si el token es inválido', async () => {
    const context = mockExecutionContext('Bearer token-invalido')
    mockFirebaseService.verifyIdToken.mockRejectedValue(
      new Error('Token inválido'),
    )

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido o expirado'),
    )
    expect(mockPrismaService.user.upsert).not.toHaveBeenCalled()
  })

  it('debe crear un usuario nuevo y devolver true (camino 🆕)', async () => {
    const context = mockExecutionContext('Bearer token-valido')
    const decodedToken = fakeDecodedToken({
      uid: 'uid-nuevo',
      email: 'nuevo@test.com',
      name: 'Nuevo Usuario',
    })

    // Firebase valida el token · Prisma NO encuentra al usuario → es nuevo
    mockFirebaseService.verifyIdToken.mockResolvedValue(decodedToken)
    mockPrismaService.user.findUnique.mockResolvedValue(null)
    mockPrismaService.user.upsert.mockResolvedValue({
      id: 'db-id-1',
      firebaseUid: 'uid-nuevo',
      email: 'nuevo@test.com',
      nombre: 'Nuevo Usuario',
      photoURL: null,
      provider: 'google',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })

    const result = await guard.canActivate(context)

    expect(result).toBe(true)
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { firebaseUid: 'uid-nuevo' },
    })
    expect(mockPrismaService.user.upsert).toHaveBeenCalledTimes(1)
    expect(mockPrismaService.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { firebaseUid: 'uid-nuevo' },
        create: expect.objectContaining({ email: 'nuevo@test.com' }),
      }),
    )
  })

  it('debe actualizar un usuario existente y devolver true (camino 🔑)', async () => {
    const context = mockExecutionContext('Bearer token-valido')
    const decodedToken = fakeDecodedToken({
      uid: 'uid-existente',
      email: 'existente@test.com',
    })

    // Firebase valida el token · Prisma SÍ encuentra al usuario → es login
    mockFirebaseService.verifyIdToken.mockResolvedValue(decodedToken)
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'db-id-2',
      firebaseUid: 'uid-existente',
      email: 'existente@test.com',
      nombre: null,
      photoURL: null,
      provider: 'google',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })
    mockPrismaService.user.upsert.mockResolvedValue({
      id: 'db-id-2',
      firebaseUid: 'uid-existente',
      email: 'existente@test.com',
      nombre: null,
      photoURL: null,
      provider: 'google',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })

    const result = await guard.canActivate(context)

    expect(result).toBe(true)
    expect(mockPrismaService.user.upsert).toHaveBeenCalledTimes(1)
    expect(mockPrismaService.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { firebaseUid: 'uid-existente' },
        update: expect.objectContaining({ email: 'existente@test.com' }),
      }),
    )
  })
})