import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockChild = {
    id: 'child-1',
    firstName: 'Lucas',
    lastName: 'Pérez',
    profileImage: null,
    allergies: null,
    medicalConditions: null,
    guardian: {
      firstName: 'María',
      lastName: 'González',
      phone: '+56912345678',
    },
  };

  const mockStaff = {
    id: 'staff-1',
    firstName: 'Juan',
    lastName: 'Pérez',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockAttendance = {
    id: 'attendance-1',
    childId: 'child-1',
    staffId: 'staff-1',
    bookingId: 'booking-1',
    date: today,
    status: AttendanceStatus.CHECKED_IN,
    checkInTime: new Date(),
    checkOutTime: null,
    notes: null,
    child: mockChild,
    staff: mockStaff,
  };

  const mockPrismaService = {
    child: {
      findUnique: jest.fn(),
    },
    attendance: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    const checkInDto = {
      childId: 'child-1',
      bookingId: 'booking-1',
      notes: 'Llegó con buen ánimo',
    };

    it('should check in a child', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.attendance.findUnique.mockResolvedValue(null);
      mockPrismaService.attendance.create.mockResolvedValue(mockAttendance);

      const result = await service.checkIn('staff-1', checkInDto);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe(AttendanceStatus.CHECKED_IN);
    });

    it('should throw NotFoundException if child not found', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(null);

      await expect(service.checkIn('staff-1', checkInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already checked in today', async () => {
      mockPrismaService.child.findUnique.mockResolvedValue(mockChild);
      mockPrismaService.attendance.findUnique.mockResolvedValue(mockAttendance);

      await expect(service.checkIn('staff-1', checkInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkOut', () => {
    const checkOutDto = {
      attendanceId: 'attendance-1',
      notes: 'Salió sin problemas',
    };

    it('should check out a child', async () => {
      mockPrismaService.attendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.attendance.update.mockResolvedValue({
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_OUT,
        checkOutTime: new Date(),
      });

      const result = await service.checkOut('staff-1', checkOutDto);

      expect(result.status).toBe(AttendanceStatus.CHECKED_OUT);
    });

    it('should throw NotFoundException if attendance not found', async () => {
      mockPrismaService.attendance.findUnique.mockResolvedValue(null);

      await expect(service.checkOut('staff-1', checkOutDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already checked out', async () => {
      mockPrismaService.attendance.findUnique.mockResolvedValue({
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_OUT,
      });

      await expect(service.checkOut('staff-1', checkOutDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTodayAttendance', () => {
    it('should return today attendance list', async () => {
      mockPrismaService.attendance.findMany.mockResolvedValue([mockAttendance]);

      const result = await service.getTodayAttendance();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { checkInTime: 'desc' },
        }),
      );
    });
  });

  describe('getChildAttendanceHistory', () => {
    it('should return paginated attendance history for a child', async () => {
      mockPrismaService.attendance.findMany.mockResolvedValue([mockAttendance]);
      mockPrismaService.attendance.count.mockResolvedValue(1);

      const result = await service.getChildAttendanceHistory('child-1', 1, 20);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { childId: 'child-1' },
        }),
      );
    });
  });

  describe('getAttendanceReport', () => {
    it('should return attendance report with stats', async () => {
      const checkedOutAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.CHECKED_OUT,
      };
      const absentAttendance = {
        ...mockAttendance,
        id: 'attendance-2',
        status: AttendanceStatus.ABSENT,
      };

      mockPrismaService.attendance.findMany.mockResolvedValue([
        mockAttendance,
        checkedOutAttendance,
        absentAttendance,
      ]);

      const from = new Date('2024-01-01');
      const to = new Date('2024-12-31');
      const result = await service.getAttendanceReport(from, to);

      expect(result).toHaveProperty('attendances');
      expect(result).toHaveProperty('stats');
      expect(result.stats.totalDays).toBe(3);
      expect(result.stats.checkedIn).toBe(1);
      expect(result.stats.checkedOut).toBe(1);
      expect(result.stats.absent).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return paginated attendance', async () => {
      mockPrismaService.attendance.findMany.mockResolvedValue([mockAttendance]);
      mockPrismaService.attendance.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
    });

    it('should filter by date range', async () => {
      mockPrismaService.attendance.findMany.mockResolvedValue([]);
      mockPrismaService.attendance.count.mockResolvedValue(0);

      await service.findAll(1, 20, '2024-01-01', '2024-12-31');

      expect(mockPrismaService.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.any(Object),
          }),
        }),
      );
    });
  });
});
