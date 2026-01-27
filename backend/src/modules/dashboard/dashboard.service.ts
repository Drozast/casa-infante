import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getGuardianSummary(guardianId: string) {
    const [children, bookings, pendingPayments] = await Promise.all([
      this.prisma.child.findMany({
        where: { guardianId },
        include: {
          preferences: true,
          _count: {
            select: {
              bookings: true,
              attendances: true,
            },
          },
        },
        orderBy: { firstName: 'asc' },
      }),
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
        take: 20,
      }),
      this.prisma.payment.findMany({
        where: {
          guardianId,
          status: PaymentStatus.PENDING,
        },
        include: {
          booking: {
            include: {
              child: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    return {
      children,
      bookings,
      pendingPayments,
    };
  }
}
