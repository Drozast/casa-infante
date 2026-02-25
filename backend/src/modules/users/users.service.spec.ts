import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+56912345678',
    rut: '12345678-9',
    role: UserRole.GUARDIAN,
    profession: 'Ingeniero',
    shareProfile: false,
    isActive: true,
    emailVerified: false,
    profileImage: null,
    password: 'hashedPassword',
    createdAt: new Date(),
    lastLoginAt: null,
    children: [],
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter by role', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll(1, 10, UserRole.ADMIN);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: UserRole.ADMIN }),
        }),
      );
    });

    it('should search by name or email', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'juan');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
              expect.objectContaining({ lastName: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'María',
      lastName: 'González',
    };

    it('should create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user',
        ...createDto,
        role: UserRole.GUARDIAN,
      });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', 'new-user');
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if RUT exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // rut check

      await expect(
        service.create({ ...createDto, rut: '12345678-9' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Juan Carlos',
    };

    it('should update a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update('user-1', updateDto);

      expect(result.firstName).toBe('Juan Carlos');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new email exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ id: 'other-user' });

      await expect(
        service.update('user-1', { email: 'other@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle user active status', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });

      const result = await service.toggleActive('user-1');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user without children', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        children: [],
      });

      const result = await service.delete('user-1');

      expect(result.message).toBe('Usuario eliminado exitosamente');
      expect(mockPrismaService.user.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if user has children', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        children: [{ id: 'child-1' }],
      });

      await expect(service.delete('user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findSharedGuardians', () => {
    it('should return guardians with shareProfile enabled', async () => {
      const sharedGuardians = [
        { ...mockUser, shareProfile: true },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(sharedGuardians);

      const result = await service.findSharedGuardians();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'GUARDIAN',
            shareProfile: true,
            isActive: true,
          }),
        }),
      );
    });

    it('should exclude current user', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await service.findSharedGuardians('user-1');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'user-1' },
          }),
        }),
      );
    });
  });
});
