import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, UserRole, PassType } from '@prisma/client';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';
import { startOfDay, endOfDay } from '../../common/utils/date.utils';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page?: number,
    limit?: number,
    status?: BookingStatus,
    from?: string,
    to?: string,
  ) {
    const pagination = getPaginationParams({ page, limit });
    const skip = pagination.skip;

    const where = {
      ...(status && { status }),
      ...(from &&
        to && {
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
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
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          slot: true,
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: pagination.limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return createPaginatedResult(bookings, total, pagination.page, pagination.limit);
  }

  async findByGuardian(guardianId: string, page?: number, limit?: number) {
    const pagination = getPaginationParams({ page, limit });

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          child: { guardianId },
        },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          slot: true,
          payment: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.booking.count({
        where: { child: { guardianId } },
      }),
    ]);

    return createPaginatedResult(bookings, total, pagination.page, pagination.limit);
  }

  async getUpcoming(guardianId: string) {
    const today = startOfDay(new Date());

    return this.prisma.booking.findMany({
      where: {
        child: { guardianId },
        date: { gte: today },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        slot: true,
      },
      orderBy: { date: 'asc' },
      take: 10,
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        child: {
          include: {
            guardian: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        slot: true,
        payment: true,
        attendance: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (
      userRole === UserRole.GUARDIAN &&
      booking.child.guardianId !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }

    return booking;
  }

  async create(
    guardianId: string,
    dto: CreateBookingDto,
    userRole: UserRole,
  ) {
    const child = await this.prisma.child.findUnique({
      where: { id: dto.childId },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    if (userRole === UserRole.GUARDIAN && child.guardianId !== guardianId) {
      throw new ForbiddenException('No tienes acceso a este niño');
    }

    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: dto.slotId },
    });

    if (!slot || !slot.isActive) {
      throw new BadRequestException('Horario no válido');
    }

    const bookingDate = new Date(dto.date);
    const dayOfWeek = bookingDate.getDay();

    if (!slot.daysOfWeek.includes(dayOfWeek)) {
      throw new BadRequestException(
        'El horario no está disponible para este día',
      );
    }

    const existingBookingsCount = await this.prisma.booking.count({
      where: {
        slotId: dto.slotId,
        date: bookingDate,
        status: { not: BookingStatus.CANCELLED },
      },
    });

    if (existingBookingsCount >= slot.maxCapacity) {
      throw new BadRequestException('No hay cupos disponibles para esta fecha');
    }

    const existingChildBooking = await this.prisma.booking.findFirst({
      where: {
        childId: dto.childId,
        date: bookingDate,
        status: { not: BookingStatus.CANCELLED },
      },
    });

    if (existingChildBooking) {
      throw new BadRequestException('El niño ya tiene una reserva para este día');
    }

    const pricing = await this.prisma.pricingConfig.findUnique({
      where: { weeklyFrequency: dto.weeklyFrequency || 1 },
    });

    const unitPrice = pricing ? Number(pricing.pricePerSession) : 22000;
    const sessionsPerMonth = (dto.weeklyFrequency || 1) * 4;
    const totalPrice = unitPrice * sessionsPerMonth;

    const booking = await this.prisma.booking.create({
      data: {
        childId: dto.childId,
        slotId: dto.slotId,
        date: bookingDate,
        passType: dto.passType || PassType.MONTHLY,
        weeklyFrequency: dto.weeklyFrequency || 1,
        unitPrice,
        totalPrice,
        notes: dto.notes,
        status: BookingStatus.PENDING,
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        slot: true,
      },
    });

    return booking;
  }

  async cancel(id: string, userId: string, userRole: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { child: true, payment: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (
      userRole === UserRole.GUARDIAN &&
      booking.child.guardianId !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    if (
      booking.payment &&
      booking.payment.status === 'COMPLETED'
    ) {
      throw new BadRequestException(
        'No se puede cancelar una reserva con pago completado',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  async getTimeSlots() {
    return this.prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAvailability(date: string, slotId?: string) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const slots = await this.prisma.timeSlot.findMany({
      where: {
        isActive: true,
        ...(slotId && { id: slotId }),
        daysOfWeek: { has: dayOfWeek },
      },
    });

    const availability = await Promise.all(
      slots.map(async (slot) => {
        const bookingsCount = await this.prisma.booking.count({
          where: {
            slotId: slot.id,
            date: targetDate,
            status: { not: BookingStatus.CANCELLED },
          },
        });

        return {
          slot,
          booked: bookingsCount,
          available: slot.maxCapacity - bookingsCount,
          isFull: bookingsCount >= slot.maxCapacity,
        };
      }),
    );

    return availability;
  }

  async getTodayBookings() {
    const today = startOfDay(new Date());
    const endToday = endOfDay(new Date());

    return this.prisma.booking.findMany({
      where: {
        date: {
          gte: today,
          lte: endToday,
        },
        status: BookingStatus.CONFIRMED,
      },
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
        slot: true,
        attendance: true,
      },
      orderBy: [{ slot: { startTime: 'asc' } }, { child: { firstName: 'asc' } }],
    });
  }
}
