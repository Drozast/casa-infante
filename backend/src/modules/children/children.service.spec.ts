import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from './children.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('ChildrenService', () => {
  let service: ChildrenService;

  const mockChild = {
    id: 'child-1',
    firstName: 'Lucas',
    lastName: 'Pérez',
    birthDate: new Date('2018-05-15'),
    gender: 'M',
    profileImage: null,
    schoolName: 'Colegio ABC',
    schoolGrade: '1° Básico',
    allergies: ['Maní'],
    medicalConditions: [],
    medications: [],
    bloodType: 'O+',
    emergencyContactName: 'María Pérez',
    emergencyContactPhone: '+56912345678',
    emergencyContactRelation: 'Madre',
    familyNotes: null,
    hasSiblings: false,
    siblingsInfo: null,
    isActive: true,
    guardianId: 'guardian-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    guardian: {
      id: 'guardian-1',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '+56912345678',
    },
    preferences: null,
    bookings: [],
    attendances: [],
  };

  const mockPrismaService = {
    child: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    childPreferences: {
      create: jest.fn(),
      update: jest.fn(),
    },
    childObservation: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated children', async () => {
      mockPrismaService.child.findMany.mockResolvedValue([mockChild]);
      mockPrismaService.child.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
    });

    it('should search by name', async () => {
      mockPrismaService.child.findMany.mockResolvedValue([]);
      mockPrismaService.child.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'lucas');

      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
              expect.objectContaining({ lastName: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findByGuardian', () => {
    it('should return children for a guardian', async () => {
      mockPrismaService.child.findMany.mockResolvedValue([mockChild]);

      const result = await service.findByGuardian('guardian-1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.child.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { guardianId: 'guardian-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a child for admin', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      const result = await service.findOne('child-1', 'admin-1', UserRole.ADMIN);

      expect(result).toEqual(mockChild);
    });

    it('should return a child for owner guardian', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      const result = await service.findOne('child-1', 'guardian-1', UserRole.GUARDIAN);

      expect(result).toEqual(mockChild);
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', 'user-1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner guardian', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      await expect(
        service.findOne('child-1', 'other-guardian', UserRole.GUARDIAN),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    const createDto = {
      firstName: 'Sofía',
      lastName: 'González',
      birthDate: '2019-03-20',
      emergencyContactName: 'Ana González',
      emergencyContactPhone: '+56987654321',
      emergencyContactRelation: 'Madre',
    };

    it('should create a child', async () => {
      mockPrismaService.child.create.mockResolvedValue({
        id: 'new-child',
        ...createDto,
        guardianId: 'guardian-1',
        preferences: {},
      });

      const result = await service.create('guardian-1', createDto);

      expect(result).toHaveProperty('id', 'new-child');
      expect(mockPrismaService.child.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            guardianId: 'guardian-1',
            preferences: { create: {} },
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      schoolGrade: '2° Básico',
    };

    it('should update a child for admin', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.child.update.mockResolvedValue({
        ...mockChild,
        ...updateDto,
      });

      const result = await service.update(
        'child-1',
        updateDto,
        'admin-1',
        UserRole.ADMIN,
      );

      expect(result.schoolGrade).toBe('2° Básico');
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateDto, 'user-1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner guardian', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      await expect(
        service.update('child-1', updateDto, 'other-guardian', UserRole.GUARDIAN),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updatePreferences', () => {
    const preferencesDto = {
      physicalActivity: true,
      musicReinforcement: true,
    };

    it('should update existing preferences', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue({
        ...mockChild,
        preferences: { id: 'pref-1' },
      });
      mockPrismaService.childPreferences.update.mockResolvedValue(preferencesDto);

      const result = await service.updatePreferences(
        'child-1',
        preferencesDto,
        'guardian-1',
        UserRole.GUARDIAN,
      );

      expect(result).toEqual(preferencesDto);
      expect(mockPrismaService.childPreferences.update).toHaveBeenCalled();
    });

    it('should create preferences if not exist', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue({
        ...mockChild,
        preferences: null,
      });
      mockPrismaService.childPreferences.create.mockResolvedValue(preferencesDto);

      await service.updatePreferences(
        'child-1',
        preferencesDto,
        'guardian-1',
        UserRole.GUARDIAN,
      );

      expect(mockPrismaService.childPreferences.create).toHaveBeenCalled();
    });
  });

  describe('addObservation', () => {
    it('should add an observation', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.childObservation.create.mockResolvedValue({
        id: 'obs-1',
        content: 'Participó activamente',
        isInternal: false,
      });

      const result = await service.addObservation(
        'child-1',
        'Participó activamente',
        'staff-1',
        false,
      );

      expect(result).toHaveProperty('id', 'obs-1');
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(
        service.addObservation('nonexistent', 'content', 'staff-1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a child without records', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue({
        ...mockChild,
        bookings: [],
        attendances: [],
      });

      const result = await service.delete('child-1', 'guardian-1', UserRole.GUARDIAN);

      expect(result).toHaveProperty('message', 'Niño eliminado exitosamente');
      expect(mockPrismaService.child.delete).toHaveBeenCalled();
    });

    it('should deactivate a child with records', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue({
        ...mockChild,
        bookings: [{ id: 'booking-1' }],
        attendances: [],
      });
      mockPrismaService.child.update.mockResolvedValue({
        ...mockChild,
        isActive: false,
      });

      const result = await service.delete('child-1', 'guardian-1', UserRole.GUARDIAN);

      expect(result).toHaveProperty('isActive', false);
      expect(mockPrismaService.child.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      await expect(
        service.delete('child-1', 'other-guardian', UserRole.GUARDIAN),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
