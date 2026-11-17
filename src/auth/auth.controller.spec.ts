// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = { id: '1', email: 'test@test.com', nombre: 'Test' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      // Saltamos el guard para probar solo la lógica del controlador
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('createSession', () => {
    it('debe devolver el usuario y isNewUser=true cuando es nueva cuenta', () => {
      const mockReq = { user: mockUser, isNewUser: true };
      const result = controller.createSession(mockReq);
      
      expect(result).toEqual({ user: mockUser, isNewUser: true });
    });

    it('debe devolver el usuario y isNewUser=false en un login recurrente', () => {
      const mockReq = { user: mockUser, isNewUser: false };
      const result = controller.createSession(mockReq);
      
      expect(result).toEqual({ user: mockUser, isNewUser: false });
    });
  });

  describe('me', () => {
    it('debe devolver el perfil del usuario', () => {
      const mockReq = { user: mockUser };
      const result = controller.me(mockReq);
      
      expect(result).toEqual(mockUser);
    });
  });
});