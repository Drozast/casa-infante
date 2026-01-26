import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import {
  getPaginationParams,
  createPaginatedResult,
} from '../../common/utils/pagination';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: true,
        guardian: true,
        booking: {
          include: { child: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.invoice) {
      throw new BadRequestException('El pago ya tiene una boleta asociada');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Solo se pueden facturar pagos completados');
    }

    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: `B-${year}` },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `B-${year}-${nextNumber.toString().padStart(6, '0')}`;
    const finalAmount = Number(payment.finalAmount);
    const taxRate = 0.19;
    const netAmount = Math.round(finalAmount / (1 + taxRate));
    const taxAmount = finalAmount - netAmount;

    return this.prisma.invoice.create({
      data: {
        paymentId,
        invoiceNumber,
        rut: payment.payerRut || payment.guardian.rut,
        businessName: payment.payerName || `${payment.guardian.firstName} ${payment.guardian.lastName}`,
        netAmount,
        taxAmount,
        totalAmount: finalAmount,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const { skip } = getPaginationParams({ page, limit });

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        include: {
          payment: {
            include: {
              guardian: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
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
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count(),
    ]);

    return createPaginatedResult(invoices, total, page, limit);
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            guardian: true,
            booking: {
              include: {
                child: true,
                slot: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Boleta no encontrada');
    }

    return invoice;
  }

  async findByNumber(invoiceNumber: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        payment: {
          include: {
            guardian: true,
            booking: {
              include: {
                child: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Boleta no encontrada');
    }

    return invoice;
  }

  async getMyInvoices(guardianId: string, page = 1, limit = 10) {
    const { skip } = getPaginationParams({ page, limit });

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          payment: { guardianId },
        },
        include: {
          payment: {
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
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({
        where: { payment: { guardianId } },
      }),
    ]);

    return createPaginatedResult(invoices, total, page, limit);
  }
}
