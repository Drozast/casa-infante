import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TransbankService } from './transbank.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, BookingStatus, UserRole } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private transbankService: TransbankService,
    private configService: ConfigService,
  ) {}

  async createPayment(guardianId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        child: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (booking.child.guardianId !== guardianId) {
      throw new ForbiddenException('No tienes acceso a esta reserva');
    }

    if (booking.payment) {
      throw new BadRequestException('Esta reserva ya tiene un pago asociado');
    }

    const amount = Number(booking.totalPrice);
    const buyOrder = `CI-${uuid().slice(0, 8).toUpperCase()}`;
    const sessionId = guardianId;

    const frontendUrl = this.configService.get<string>('frontend.url');
    const returnUrl = `${frontendUrl}/payments/callback`;

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        guardianId,
        amount,
        finalAmount: amount,
        transbankOrderId: buyOrder,
        status: PaymentStatus.PROCESSING,
      },
    });

    try {
      const transaction = await this.transbankService.createTransaction(
        buyOrder,
        sessionId,
        amount,
        returnUrl,
      );

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          transbankToken: transaction.token,
        },
      });

      return {
        paymentId: payment.id,
        token: transaction.token,
        url: transaction.url,
        amount,
      };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new BadRequestException('Error al crear transacción de pago');
    }
  }

  async processCallback(token: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { transbankToken: token },
      include: { booking: true },
    });

    if (!payment) {
      return {
        success: false,
        reason: 'payment_not_found',
      };
    }

    try {
      const result = await this.transbankService.commitTransaction(token);

      if (this.transbankService.isSuccessful(result.responseCode)) {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              paidAt: new Date(),
              transbankResponse: JSON.parse(JSON.stringify(result)),
            },
          }),
          this.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
              status: BookingStatus.CONFIRMED,
              confirmedAt: new Date(),
            },
          }),
        ]);

        return {
          success: true,
          orderId: payment.transbankOrderId,
        };
      } else {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            transbankResponse: JSON.parse(JSON.stringify(result)),
          },
        });

        return {
          success: false,
          reason: 'transaction_rejected',
        };
      }
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      return {
        success: false,
        reason: 'transaction_error',
      };
    }
  }

  async getPaymentsByGuardian(guardianId: string, page = 1, limit = 10) {
    const { skip } = getPaginationParams({ page, limit });

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { guardianId },
        include: {
          booking: {
            include: {
              child: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              slot: true,
            },
          },
          invoice: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { guardianId } }),
    ]);

    return createPaginatedResult(payments, total, page, limit);
  }

  async getPendingPayments(guardianId: string) {
    return this.prisma.payment.findMany({
      where: {
        guardianId,
        status: PaymentStatus.PENDING,
      },
      include: {
        booking: {
          include: {
            child: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getPaymentById(id: string, user: { sub: string; role: UserRole }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            child: {
              include: {
                guardian: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            slot: true,
          },
        },
        invoice: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (
      user.role === UserRole.GUARDIAN &&
      payment.guardianId !== user.sub
    ) {
      throw new ForbiddenException('No tienes acceso a este pago');
    }

    return payment;
  }

  async getAllPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const { skip, page, limit } = getPaginationParams(params);

    const where = {
      ...(params.status && { status: params.status as PaymentStatus }),
      ...(params.from &&
        params.to && {
          createdAt: {
            gte: new Date(params.from),
            lte: new Date(params.to),
          },
        }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              child: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          guardian: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return createPaginatedResult(payments, total, page, limit);
  }

  async refundPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Solo se pueden reembolsar pagos completados',
      );
    }

    if (!payment.transbankToken) {
      throw new BadRequestException('El pago no tiene token de transacción');
    }

    try {
      await this.transbankService.refundTransaction(
        payment.transbankToken,
        Number(payment.finalAmount),
      );

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id },
          data: { status: PaymentStatus.REFUNDED },
        }),
        this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.CANCELLED },
        }),
      ]);

      return { message: 'Reembolso procesado exitosamente' };
    } catch (error) {
      throw new BadRequestException('Error al procesar reembolso');
    }
  }
}
