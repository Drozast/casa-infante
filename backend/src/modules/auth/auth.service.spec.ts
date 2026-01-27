import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.secret': 'test-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.expiration': '15m',
      'jwt.refreshExpiration': '7d',
      'frontend.url': 'http://localhost:3030',
    };
    return config[key];
  }),
};

const mockNotificationsService = {
  sendEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.cl',
      password: 'Password1!',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      phone: '+56912345678',
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.cl',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        role: 'GUARDIAN',
      });
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.user.email).toBe('test@example.cl');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.cl',
            password: 'hashed-password',
            firstName: 'Maria',
            lastName: 'Gonzalez',
            role: 'GUARDIAN',
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.cl',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if RUT already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: 'existing-user', rut: '12345678-9' }); // rut check

      await expect(
        service.register({ ...registerDto, rut: '12345678-9' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.cl', password: 'Password1!' };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.cl',
        password: 'hashed-password',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        role: 'GUARDIAN',
        profileImage: null,
        isActive: true,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.user.email).toBe('test@example.cl');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.cl',
        password: 'hashed',
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.cl',
        password: 'hashed',
        isActive: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.cl',
        role: 'GUARDIAN',
        refreshToken: 'hashed-refresh-token',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh');
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.refreshTokens('user-1', 'old-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('user-1', 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        refreshToken: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshTokens('user-1', 'wrong-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.logout('user-1');

      expect(result.message).toBe('Sesión cerrada exitosamente');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: null },
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 'user-1',
        email: 'test@example.cl',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        phone: '+56912345678',
        rut: null,
        role: 'GUARDIAN',
        profileImage: null,
        emailVerified: false,
        createdAt: new Date(),
        lastLoginAt: null,
        children: [],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-1');

      expect(result.email).toBe('test@example.cl');
      expect(result.firstName).toBe('Maria');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message even if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.cl');

      expect(result.message).toContain('Si el correo está registrado');
      expect(mockNotificationsService.sendEmail).not.toHaveBeenCalled();
    });

    it('should return generic message if user is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.cl',
        isActive: false,
      });

      const result = await service.forgotPassword('test@example.cl');

      expect(result.message).toContain('Si el correo está registrado');
      expect(mockNotificationsService.sendEmail).not.toHaveBeenCalled();
    });

    it('should generate token and send email for valid user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.cl',
        firstName: 'Maria',
        isActive: true,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
      mockPrismaService.user.update.mockResolvedValue({});
      mockNotificationsService.sendEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword('test@example.cl');

      expect(result.message).toContain('Si el correo está registrado');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            resetPasswordToken: 'hashed-token',
            resetPasswordExpires: expect.any(Date),
          }),
        }),
      );
      expect(mockNotificationsService.sendEmail).toHaveBeenCalledWith(
        'test@example.cl',
        'Restablecer Contraseña - Casa Infante',
        expect.stringContaining('reset-password?token='),
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if no matching token found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await expect(
        service.resetPassword('invalid-token', 'NewPassword1!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token does not match any user', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: new Date(Date.now() + 3600000),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.resetPassword('wrong-token', 'NewPassword1!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password successfully with valid token', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: new Date(Date.now() + 3600000),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.resetPassword('valid-token', 'NewPassword1!');

      expect(result.message).toBe('Contraseña actualizada exitosamente');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'new-hashed-password',
          resetPasswordToken: null,
          resetPasswordExpires: null,
          refreshToken: null,
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'old-hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.changePassword(
        'user-1',
        'OldPassword1!',
        'NewPassword1!',
      );

      expect(result.message).toBe('Contraseña actualizada exitosamente');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', 'old', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if current password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'old-hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', 'wrong', 'NewPassword1!'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
