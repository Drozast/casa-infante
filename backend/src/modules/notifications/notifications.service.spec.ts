import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'smtp.host': 'smtp.test.com',
      'smtp.port': '587',
      'smtp.user': 'testuser',
      'smtp.password': 'testpass',
      'smtp.from': 'test@test.com',
    };
    return config[key];
  }),
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create notification and send email', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'test',
        title: 'Test',
        message: 'Test message',
      };
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'test@example.cl',
        firstName: 'Maria',
      });
      mockPrismaService.notification.update.mockResolvedValue({});

      const result = await service.createNotification(
        'user-1',
        'test',
        'Test',
        'Test message',
        true,
      );

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { email: true, firstName: true },
      });
    });

    it('should create notification without sending email', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'test',
        title: 'Test',
        message: 'Test message',
      };
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(
        'user-1',
        'test',
        'Test',
        'Test message',
        false,
      );

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const notifications = [
        { id: '1', title: 'Notif 1' },
        { id: '2', title: 'Notif 2' },
      ];
      mockPrismaService.notification.findMany.mockResolvedValue(notifications);

      const result = await service.getUserNotifications('user-1');

      expect(result).toEqual(notifications);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsRead('notif-1', 'user-1');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      await service.markAllAsRead('user-1');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true, readAt: expect.any(Date) },
      });
    });
  });
});
