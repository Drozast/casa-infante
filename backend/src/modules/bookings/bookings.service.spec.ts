import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, UserRole, PassType } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockTimeSlot = {
    id: 'slot-1',
    name: 'Mañana',
    startTime: '08:00',
    endTime: '13:00',
    maxCapacity: 20,
    isActive: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Todos los días (para evitar problemas de timezone en tests)
  };

  const mockChild = {
    id: 'child-1',
    firstName: 'Lucas',
    lastName: 'Pérez',
    guardianId: 'guardian-1',
  };

  const mockBooking = {
    id: 'booking-1',
    childId: 'child-1',
    slotId: 'slot-1',
    date: new Date('2024-03-15'),
    passType: PassType.MONTHLY,
    status: BookingStatus.PENDING,
    weeklyFrequency: 1,
    unitPrice: 22000,
    totalPrice: 88000,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    child: mockChild,
    slot: mockTimeSlot,
    payment: null,
    attendance: null,
  };

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    child: {
      findUnique: jest.fn(),
    },
    timeSlot: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    pricingConfig: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.booking.count.mockResolvedValue(0);

      await service.findAll(1, 10, BookingStatus.CONFIRMED);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: BookingStatus.CONFIRMED }),
        }),
      );
    });
  });

  describe('findByGuardian', () => {
    it('should return bookings for a guardian', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findByGuardian('guardian-1');

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a booking for admin', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking-1', 'admin-1', UserRole.ADMIN);

      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', 'user-1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner guardian', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.findOne('booking-1', 'other-guardian', UserRole.GUARDIAN),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    const createDto = {
      childId: 'child-1',
      slotId: 'slot-1',
      date: '2024-03-18', // Lunes
      weeklyFrequency: 1,
    };

    it('should create a booking', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.timeSlot.findUnique.mockResolvedValue(mockTimeSlot);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.pricingConfig.findUnique.mockResolvedValue({
        pricePerSession: 22000,
      });
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);

      const result = await service.create(
        'guardian-1',
        createDto,
        UserRole.GUARDIAN,
      );

      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(
        service.create('guardian-1', createDto, UserRole.GUARDIAN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if guardian not owner of child', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);

      await expect(
        service.create('other-guardian', createDto, UserRole.GUARDIAN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if slot is inactive', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.timeSlot.findUnique.mockResolvedValue({
        ...mockTimeSlot,
        isActive: false,
      });

      await expect(
        service.create('guardian-1', createDto, UserRole.GUARDIAN),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no capacity', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.timeSlot.findUnique.mockResolvedValue(mockTimeSlot);
      mockPrismaService.booking.count.mockResolvedValue(20); // Full capacity

      await expect(
        service.create('guardian-1', createDto, UserRole.GUARDIAN),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if child already has booking', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.timeSlot.findUnique.mockResolvedValue(mockTimeSlot);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking);

      await expect(
        service.create('guardian-1', createDto, UserRole.GUARDIAN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const result = await service.cancel(
        'booking-1',
        'guardian-1',
        UserRole.GUARDIAN,
      );

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.cancel('nonexistent', 'user-1', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        service.cancel('booking-1', 'guardian-1', UserRole.GUARDIAN),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if payment completed', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        payment: { status: 'COMPLETED' },
      });

      await expect(
        service.cancel('booking-1', 'guardian-1', UserRole.GUARDIAN),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTimeSlots', () => {
    it('should return active time slots', async () => {
      mockPrismaService.timeSlot.findMany.mockResolvedValue([mockTimeSlot]);

      const result = await service.getTimeSlots();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.timeSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('getAvailability', () => {
    it('should return availability for a date', async () => {
      mockPrismaService.timeSlot.findMany.mockResolvedValue([mockTimeSlot]);
      mockPrismaService.booking.count.mockResolvedValue(5);

      const result = await service.getAvailability('2024-03-18');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('available', 15);
      expect(result[0]).toHaveProperty('isFull', false);
    });
  });

  describe('getTodayBookings', () => {
    it('should return confirmed bookings for today', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);

      const result = await service.getTodayBookings();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: BookingStatus.CONFIRMED,
          }),
        }),
      );
    });
  });
});
