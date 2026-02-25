import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TransbankService } from './transbank.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentStatus, BookingStatus, UserRole } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockChild = {
    id: 'child-1',
    firstName: 'Lucas',
    lastName: 'Pérez',
    guardianId: 'guardian-1',
  };

  const mockBooking = {
    id: 'booking-1',
    childId: 'child-1',
    totalPrice: 88000,
    child: mockChild,
    payment: null,
  };

  const mockPayment = {
    id: 'payment-1',
    bookingId: 'booking-1',
    guardianId: 'guardian-1',
    amount: 88000,
    finalAmount: 88000,
    status: PaymentStatus.COMPLETED,
    transbankOrderId: 'CI-ABC12345',
    transbankToken: 'token-123',
    paidAt: new Date(),
    createdAt: new Date(),
    booking: mockBooking,
    invoice: null,
  };

  const mockPrismaService = {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockTransbankService = {
    createTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    refundTransaction: jest.fn(),
    isSuccessful: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TransbankService, useValue: mockTransbankService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    const createDto = { bookingId: 'booking-1' };

    it('should create a payment and initiate transbank transaction', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.payment.create.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PROCESSING,
      });
      mockPrismaService.payment.update.mockResolvedValue(mockPayment);
      mockTransbankService.createTransaction.mockResolvedValue({
        token: 'transbank-token',
        url: 'https://webpay.cl/pay',
      });

      const result = await service.createPayment('guardian-1', createDto);

      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('token', 'transbank-token');
      expect(result).toHaveProperty('url', 'https://webpay.cl/pay');
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.createPayment('guardian-1', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner of booking', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.createPayment('other-guardian', createDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if booking already has payment', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        payment: mockPayment,
      });

      await expect(
        service.createPayment('guardian-1', createDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark payment as failed if transbank fails', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.payment.create.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PROCESSING,
      });
      mockTransbankService.createTransaction.mockRejectedValue(
        new Error('Transbank error'),
      );
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      await expect(
        service.createPayment('guardian-1', createDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: PaymentStatus.FAILED },
        }),
      );
    });
  });

  describe('processCallback', () => {
    it('should complete payment on successful transaction', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);
      mockTransbankService.commitTransaction.mockResolvedValue({
        responseCode: 0,
      });
      mockTransbankService.isSuccessful.mockReturnValue(true);
      mockPrismaService.$transaction.mockResolvedValue([]);

      const result = await service.processCallback('token-123');

      expect(result.success).toBe(true);
      expect(result.orderId).toBe(mockPayment.transbankOrderId);
    });

    it('should return failure if payment not found', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      const result = await service.processCallback('invalid-token');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('payment_not_found');
    });

    it('should mark as failed on rejected transaction', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(mockPayment);
      mockTransbankService.commitTransaction.mockResolvedValue({
        responseCode: -1,
      });
      mockTransbankService.isSuccessful.mockReturnValue(false);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      const result = await service.processCallback('token-123');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('transaction_rejected');
    });
  });

  describe('getPaymentsByGuardian', () => {
    it('should return paginated payments for guardian', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([mockPayment]);
      mockPrismaService.payment.count.mockResolvedValue(1);

      const result = await service.getPaymentsByGuardian('guardian-1', 1, 10);

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getPendingPayments', () => {
    it('should return pending payments for guardian', async () => {
      const pendingPayment = { ...mockPayment, status: PaymentStatus.PENDING };
      mockPrismaService.payment.findMany.mockResolvedValue([pendingPayment]);

      const result = await service.getPendingPayments('guardian-1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            guardianId: 'guardian-1',
            status: PaymentStatus.PENDING,
          }),
        }),
      );
    });
  });

  describe('getPaymentById', () => {
    it('should return payment for admin', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-1', {
        sub: 'admin-1',
        role: UserRole.ADMIN,
      });

      expect(result).toEqual(mockPayment);
    });

    it('should return payment for owner guardian', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById('payment-1', {
        sub: 'guardian-1',
        role: UserRole.GUARDIAN,
      });

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.getPaymentById('nonexistent', {
          sub: 'admin-1',
          role: UserRole.ADMIN,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner guardian', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      await expect(
        service.getPaymentById('payment-1', {
          sub: 'other-guardian',
          role: UserRole.GUARDIAN,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllPayments', () => {
    it('should return paginated payments', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([mockPayment]);
      mockPrismaService.payment.count.mockResolvedValue(1);

      const result = await service.getAllPayments({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      await service.getAllPayments({
        page: 1,
        limit: 10,
        status: PaymentStatus.COMPLETED,
      });

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PaymentStatus.COMPLETED }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      await service.getAllPayments({
        page: 1,
        limit: 10,
        from: '2024-01-01',
        to: '2024-12-31',
      });

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockTransbankService.refundTransaction.mockResolvedValue({});
      mockPrismaService.$transaction.mockResolvedValue([]);

      const result = await service.refundPayment('payment-1');

      expect(result.message).toBe('Reembolso procesado exitosamente');
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.refundPayment('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment not completed', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PENDING,
      });

      await expect(service.refundPayment('payment-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no transbank token', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        transbankToken: null,
      });

      await expect(service.refundPayment('payment-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
