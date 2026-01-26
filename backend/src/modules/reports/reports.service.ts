import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { startOfMonth, endOfMonth } from '../../common/utils/date.utils';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const [
      totalChildren,
      activeChildren,
      totalUsers,
      monthlyBookings,
      monthlyRevenue,
      todayAttendance,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.child.count(),
      this.prisma.child.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.booking.count({
        where: {
          date: { gte: monthStart, lte: monthEnd },
          status: BookingStatus.CONFIRMED,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          paidAt: { gte: monthStart, lte: monthEnd },
          status: PaymentStatus.COMPLETED,
        },
        _sum: { finalAmount: true },
      }),
      this.prisma.attendance.count({
        where: {
          date: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.PENDING },
      }),
    ]);

    return {
      totalChildren,
      activeChildren,
      totalUsers,
      monthlyBookings,
      monthlyRevenue: monthlyRevenue._sum.finalAmount || 0,
      todayAttendance,
      pendingPayments,
    };
  }

  async getRevenueReport(from: Date, to: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        paidAt: { gte: from, lte: to },
        status: PaymentStatus.COMPLETED,
      },
      include: {
        booking: {
          include: {
            child: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.finalAmount),
      0,
    );

    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + Number(p.finalAmount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      payments,
      summary: {
        totalRevenue,
        totalPayments: payments.length,
        byMethod,
      },
    };
  }

  async getAttendanceReport(from: Date, to: Date) {
    const attendances = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { date: { gte: from, lte: to } },
      _count: true,
    });

    const childAttendance = await this.prisma.attendance.groupBy({
      by: ['childId'],
      where: { date: { gte: from, lte: to } },
      _count: true,
    });

    const children = await this.prisma.child.findMany({
      where: {
        id: { in: childAttendance.map((a) => a.childId) },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const childMap = children.reduce(
      (acc, c) => {
        acc[c.id] = `${c.firstName} ${c.lastName}`;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      dailyStats: attendances,
      byChild: childAttendance.map((a) => ({
        childId: a.childId,
        childName: childMap[a.childId],
        count: a._count,
      })),
    };
  }

  async getBookingsReport(from: Date, to: Date) {
    const bookings = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { date: { gte: from, lte: to } },
      _count: true,
    });

    const bySlot = await this.prisma.booking.groupBy({
      by: ['slotId'],
      where: {
        date: { gte: from, lte: to },
        status: BookingStatus.CONFIRMED,
      },
      _count: true,
    });

    const slots = await this.prisma.timeSlot.findMany();
    const slotMap = slots.reduce(
      (acc, s) => {
        acc[s.id] = s.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      byStatus: bookings,
      bySlot: bySlot.map((b) => ({
        slotId: b.slotId,
        slotName: slotMap[b.slotId],
        count: b._count,
      })),
    };
  }

  async getChildrenReport() {
    const children = await this.prisma.child.findMany({
      include: {
        guardian: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            attendances: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    const ageGroups = children.reduce(
      (acc, child) => {
        const age = Math.floor(
          (Date.now() - new Date(child.birthDate).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        );
        const group = `${age} años`;
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      children,
      summary: {
        total: children.length,
        active: children.filter((c) => c.isActive).length,
        ageGroups,
      },
    };
  }
}
