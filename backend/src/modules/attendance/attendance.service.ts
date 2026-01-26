import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';
import { startOfDay, endOfDay } from '../../common/utils/date.utils';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(staffId: string, dto: CheckInDto) {
    const { childId, bookingId, notes } = dto;

    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    const today = startOfDay(new Date());

    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        childId_date: {
          childId,
          date: today,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        'El niño ya tiene registro de asistencia hoy',
      );
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        childId,
        staffId,
        bookingId,
        date: today,
        status: AttendanceStatus.CHECKED_IN,
        checkInTime: new Date(),
        notes,
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return attendance;
  }

  async checkOut(staffId: string, dto: CheckOutDto) {
    const { attendanceId, notes } = dto;

    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    if (attendance.status === AttendanceStatus.CHECKED_OUT) {
      throw new BadRequestException('Ya se registró la salida');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: AttendanceStatus.CHECKED_OUT,
        checkOutTime: new Date(),
        notes: notes
          ? `${attendance.notes || ''}\n${notes}`.trim()
          : attendance.notes,
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }

  async getTodayAttendance() {
    const today = startOfDay(new Date());

    return this.prisma.attendance.findMany({
      where: { date: today },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            allergies: true,
            medicalConditions: true,
            guardian: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async getChildAttendanceHistory(childId: string, page = 1, limit = 20) {
    const { skip } = getPaginationParams({ page, limit });

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { childId },
        include: {
          staff: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where: { childId } }),
    ]);

    return createPaginatedResult(attendances, total, page, limit);
  }

  async getAttendanceReport(from: Date, to: Date) {
    const attendances = await this.prisma.attendance.findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        staff: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const stats = {
      totalDays: attendances.length,
      checkedIn: attendances.filter(
        (a) => a.status === AttendanceStatus.CHECKED_IN,
      ).length,
      checkedOut: attendances.filter(
        (a) => a.status === AttendanceStatus.CHECKED_OUT,
      ).length,
      absent: attendances.filter(
        (a) => a.status === AttendanceStatus.ABSENT,
      ).length,
    };

    return { attendances, stats };
  }

  async findAll(page = 1, limit = 20, from?: string, to?: string) {
    const { skip } = getPaginationParams({ page, limit });

    const where = {
      ...(from &&
        to && {
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
    };

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              guardian: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          staff: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return createPaginatedResult(attendances, total, page, limit);
  }
}
