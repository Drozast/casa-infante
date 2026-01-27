import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  logout: jest.fn(),
  getProfile: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = {
        email: 'test@example.cl',
        password: 'Password1!',
        firstName: 'Maria',
        lastName: 'Gonzalez',
      };
      const expected = {
        user: { id: '1', email: 'test@example.cl', firstName: 'Maria', lastName: 'Gonzalez', role: 'GUARDIAN' },
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto as any);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'test@example.cl', password: 'Password1!' };
      const expected = {
        user: { id: '1', email: 'test@example.cl' },
        accessToken: 'token',
        refreshToken: 'refresh',
      };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens', async () => {
      const expected = { accessToken: 'new', refreshToken: 'new-refresh' };
      mockAuthService.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refresh('user-1', {
        refreshToken: 'old-token',
      });

      expect(result).toEqual(expected);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        'user-1',
        'old-token',
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const expected = { message: 'Sesión cerrada exitosamente' };
      mockAuthService.logout.mockResolvedValue(expected);

      const result = await controller.logout('user-1');

      expect(result).toEqual(expected);
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile', async () => {
      const expected = {
        id: 'user-1',
        email: 'test@example.cl',
        firstName: 'Maria',
      };
      mockAuthService.getProfile.mockResolvedValue(expected);

      const result = await controller.getProfile('user-1');

      expect(result).toEqual(expected);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with email', async () => {
      const expected = { message: 'Si el correo está registrado...' };
      mockAuthService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword({
        email: 'test@example.cl',
      });

      expect(result).toEqual(expected);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        'test@example.cl',
      );
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with token and password', async () => {
      const expected = { message: 'Contraseña actualizada exitosamente' };
      mockAuthService.resetPassword.mockResolvedValue(expected);

      const result = await controller.resetPassword({
        token: 'abc123',
        newPassword: 'NewPassword1!',
      });

      expect(result).toEqual(expected);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'abc123',
        'NewPassword1!',
      );
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const expected = { message: 'Contraseña actualizada exitosamente' };
      mockAuthService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword('user-1', {
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
      });

      expect(result).toEqual(expected);
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        'user-1',
        'OldPassword1!',
        'NewPassword1!',
      );
    });
  });
});
