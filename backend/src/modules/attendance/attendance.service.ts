import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttendanceStatus, BillingType, PaymentStatus } from '@prisma/client';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';
import { startOfDay } from '../../common/utils/date.utils';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(staffId: string, dto: CheckInDto) {
    const { childId, bookingId, notes, date, slotId, billingType, hasLunch, hasPickup, pickupTime } = dto;

    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: { guardian: true },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    // Usar fecha proporcionada o fecha actual
    const attendanceDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

    // Verificar que no sea viernes (Casa Infante no abre los viernes)
    if (attendanceDate.getDay() === 5) {
      throw new BadRequestException('Casa Infante no abre los viernes');
    }

    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        childId_date: {
          childId,
          date: attendanceDate,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        `El niño ya tiene registro de asistencia para ${attendanceDate.toLocaleDateString('es-CL')}`,
      );
    }

    // Determinar billingType
    let finalBillingType = billingType || BillingType.POSTPAID;

    // Si hay booking asociado, es PREPAID
    if (bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (booking?.payment?.status === PaymentStatus.COMPLETED) {
        finalBillingType = BillingType.PREPAID;
      }
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        childId,
        staffId,
        bookingId,
        slotId,
        date: attendanceDate,
        status: AttendanceStatus.CHECKED_IN,
        checkInTime: new Date(),
        billingType: finalBillingType,
        hasLunch: hasLunch || false,
        hasPickup: hasPickup || false,
        pickupTime: pickupTime || null,
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

  async updateAttendance(attendanceId: string, data: { hasLunch?: boolean; hasPickup?: boolean; pickupTime?: string; notes?: string }) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...(data.hasLunch !== undefined && { hasLunch: data.hasLunch }),
        ...(data.hasPickup !== undefined && { hasPickup: data.hasPickup }),
        ...(data.pickupTime !== undefined && { pickupTime: data.pickupTime }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
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
          monthlyBilling: {
            select: {
              id: true,
              status: true,
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

  // ═══════════════════════════════════════════════════════════════════
  // CALENDARIO MENSUAL (Vista "Cartulina")
  // ═══════════════════════════════════════════════════════════════════

  async getMonthlyCalendar(childId: string, month: number, year: number) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: {
        guardian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Obtener asistencias del mes
    const attendances = await this.prisma.attendance.findMany({
      where: {
        childId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Obtener cobro mensual si existe
    const monthlyBilling = await this.prisma.monthlyBilling.findUnique({
      where: {
        childId_month_year: {
          childId,
          month,
          year,
        },
      },
    });

    // Construir calendario
    const daysInMonth = endDate.getDate();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const attendance = attendances.find(
        (a) => new Date(a.date).getDate() === day,
      );

      calendar.push({
        day,
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: currentDate.getDay(),
        attendance: attendance
          ? {
              id: attendance.id,
              status: attendance.status,
              billingType: attendance.billingType,
              checkInTime: attendance.checkInTime,
              checkOutTime: attendance.checkOutTime,
              hasLunch: attendance.hasLunch,
              hasPickup: attendance.hasPickup,
              pickupTime: attendance.pickupTime,
            }
          : null,
      });
    }

    // Calcular resumen
    const summary = {
      totalDays: attendances.length,
      prepaidDays: attendances.filter((a) => a.billingType === BillingType.PREPAID).length,
      postpaidDays: attendances.filter((a) => a.billingType === BillingType.POSTPAID).length,
      billedDays: attendances.filter((a) => a.billingType === BillingType.BILLED).length,
      monthlyBilling: monthlyBilling
        ? {
            id: monthlyBilling.id,
            status: monthlyBilling.status,
            totalAmount: monthlyBilling.totalAmount,
            paidAt: monthlyBilling.paidAt,
          }
        : null,
    };

    return {
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        guardian: child.guardian,
      },
      month,
      year,
      calendar,
      summary,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // GENERAR COBRO MENSUAL
  // ═══════════════════════════════════════════════════════════════════

  async generateMonthlyBilling(childId: string, month: number, year: number) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
      include: { guardian: true },
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    // Verificar si ya existe cobro para este mes
    const existingBilling = await this.prisma.monthlyBilling.findUnique({
      where: {
        childId_month_year: {
          childId,
          month,
          year,
        },
      },
    });

    if (existingBilling) {
      throw new BadRequestException(
        `Ya existe un cobro para ${child.firstName} en ${month}/${year}`,
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Obtener asistencias POSTPAID del mes
    const postpaidAttendances = await this.prisma.attendance.findMany({
      where: {
        childId,
        billingType: BillingType.POSTPAID,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (postpaidAttendances.length === 0) {
      throw new BadRequestException(
        `No hay asistencias pendientes de cobro para ${child.firstName} en ${month}/${year}`,
      );
    }

    // Obtener precio por día de la configuración
    const pricingConfig = await this.prisma.pricingConfig.findFirst({
      where: { weeklyFrequency: 1, isActive: true },
    });

    const pricePerDay = pricingConfig
      ? Number(pricingConfig.pricePerSession)
      : 22000;

    const totalDays = postpaidAttendances.length;
    const subtotal = totalDays * pricePerDay;

    // Crear cobro mensual
    const monthlyBilling = await this.prisma.monthlyBilling.create({
      data: {
        childId,
        guardianId: child.guardianId,
        month,
        year,
        totalDays,
        pricePerDay,
        subtotal,
        totalAmount: subtotal,
        status: PaymentStatus.PENDING,
      },
    });

    // Actualizar asistencias como BILLED
    await this.prisma.attendance.updateMany({
      where: {
        id: { in: postpaidAttendances.map((a) => a.id) },
      },
      data: {
        billingType: BillingType.BILLED,
        monthlyBillingId: monthlyBilling.id,
      },
    });

    return {
      ...monthlyBilling,
      child: {
        firstName: child.firstName,
        lastName: child.lastName,
      },
      attendances: postpaidAttendances.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // LISTAR COBROS MENSUALES
  // ═══════════════════════════════════════════════════════════════════

  async getMonthlyBillings(
    page = 1,
    limit = 20,
    status?: PaymentStatus,
    month?: number,
    year?: number,
  ) {
    const { skip } = getPaginationParams({ page, limit });

    const where = {
      ...(status && { status }),
      ...(month && { month }),
      ...(year && { year }),
    };

    const [billings, total] = await Promise.all([
      this.prisma.monthlyBilling.findMany({
        where,
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          guardian: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: { attendances: true },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.monthlyBilling.count({ where }),
    ]);

    return createPaginatedResult(billings, total, page, limit);
  }

  // ═══════════════════════════════════════════════════════════════════
  // MARCAR COBRO COMO PAGADO
  // ═══════════════════════════════════════════════════════════════════

  async markBillingAsPaid(billingId: string, method: string) {
    const billing = await this.prisma.monthlyBilling.findUnique({
      where: { id: billingId },
    });

    if (!billing) {
      throw new NotFoundException('Cobro no encontrado');
    }

    if (billing.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Este cobro ya está pagado');
    }

    return this.prisma.monthlyBilling.update({
      where: { id: billingId },
      data: {
        status: PaymentStatus.COMPLETED,
        method: method as any,
        paidAt: new Date(),
      },
      include: {
        child: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBTENER NIÑOS CON ASISTENCIAS PENDIENTES DE COBRO
  // ═══════════════════════════════════════════════════════════════════

  async getChildrenWithPendingBilling(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const children = await this.prisma.child.findMany({
      where: {
        isActive: true,
        attendances: {
          some: {
            billingType: BillingType.POSTPAID,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      include: {
        guardian: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attendances: {
          where: {
            billingType: BillingType.POSTPAID,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    return children.map((child) => ({
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      guardian: child.guardian,
      pendingDays: child.attendances.length,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════
  // ELIMINAR ASISTENCIA
  // ═══════════════════════════════════════════════════════════════════

  async deleteAttendance(attendanceId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    if (attendance.billingType === BillingType.BILLED) {
      throw new BadRequestException(
        'No se puede eliminar una asistencia que ya fue cobrada',
      );
    }

    return this.prisma.attendance.delete({
      where: { id: attendanceId },
    });
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
      prepaid: attendances.filter(
        (a) => a.billingType === BillingType.PREPAID,
      ).length,
      postpaid: attendances.filter(
        (a) => a.billingType === BillingType.POSTPAID,
      ).length,
      billed: attendances.filter(
        (a) => a.billingType === BillingType.BILLED,
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
