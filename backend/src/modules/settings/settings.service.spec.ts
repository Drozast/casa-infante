import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;

  const mockSetting = {
    id: 'setting-1',
    key: 'site_name',
    value: 'Casa Infante',
    updatedById: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPricingConfig = {
    id: 'pricing-1',
    weeklyFrequency: 1,
    pricePerSession: 22000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDiscountConfig = {
    id: 'discount-1',
    name: 'Segundo hijo',
    percentage: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeSlot = {
    id: 'slot-1',
    name: 'Mañana',
    startTime: '08:00',
    endTime: '13:00',
    maxCapacity: 20,
    isActive: true,
    daysOfWeek: [1, 2, 3, 4, 5],
  };

  const mockContentBlock = {
    id: 'block-1',
    slug: 'home_hero',
    title: 'Bienvenidos',
    content: 'Contenido del hero',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    systemSettings: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    pricingConfig: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    discountConfig: {
      findMany: jest.fn(),
    },
    timeSlot: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    contentBlock: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all settings as key-value object', async () => {
      mockPrismaService.systemSettings.findMany.mockResolvedValue([
        mockSetting,
        { ...mockSetting, key: 'site_email', value: 'info@casainfante.cl' },
      ]);

      const result = await service.getAll();

      expect(result).toHaveProperty('site_name', 'Casa Infante');
      expect(result).toHaveProperty('site_email', 'info@casainfante.cl');
    });
  });

  describe('get', () => {
    it('should return a specific setting value', async () => {
      mockPrismaService.systemSettings.findUnique.mockResolvedValue(mockSetting);

      const result = await service.get('site_name');

      expect(result).toBe('Casa Infante');
    });

    it('should throw NotFoundException if setting not found', async () => {
      mockPrismaService.systemSettings.findUnique.mockResolvedValue(null);

      await expect(service.get('nonexistent_key')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('set', () => {
    it('should create or update a setting', async () => {
      mockPrismaService.systemSettings.upsert.mockResolvedValue(mockSetting);

      const result = await service.set('site_name', 'New Name', 'admin-1');

      expect(result).toEqual(mockSetting);
      expect(mockPrismaService.systemSettings.upsert).toHaveBeenCalledWith({
        where: { key: 'site_name' },
        update: { value: 'New Name', updatedById: 'admin-1' },
        create: { key: 'site_name', value: 'New Name', updatedById: 'admin-1' },
      });
    });
  });

  describe('getPricingConfigs', () => {
    it('should return active pricing configs sorted by frequency', async () => {
      mockPrismaService.pricingConfig.findMany.mockResolvedValue([
        mockPricingConfig,
        { ...mockPricingConfig, weeklyFrequency: 2, pricePerSession: 20000 },
      ]);

      const result = await service.getPricingConfigs();

      expect(result).toHaveLength(2);
      expect(mockPrismaService.pricingConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { weeklyFrequency: 'asc' },
      });
    });
  });

  describe('updatePricingConfig', () => {
    it('should upsert a pricing config', async () => {
      mockPrismaService.pricingConfig.upsert.mockResolvedValue(mockPricingConfig);

      const result = await service.updatePricingConfig(1, 25000, 'admin-1');

      expect(result).toEqual(mockPricingConfig);
      expect(mockPrismaService.pricingConfig.upsert).toHaveBeenCalledWith({
        where: { weeklyFrequency: 1 },
        update: { pricePerSession: 25000 },
        create: { weeklyFrequency: 1, pricePerSession: 25000 },
      });
    });
  });

  describe('getDiscountConfigs', () => {
    it('should return active discount configs', async () => {
      mockPrismaService.discountConfig.findMany.mockResolvedValue([
        mockDiscountConfig,
      ]);

      const result = await service.getDiscountConfigs();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.discountConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('getTimeSlots', () => {
    it('should return time slots sorted by start time', async () => {
      mockPrismaService.timeSlot.findMany.mockResolvedValue([mockTimeSlot]);

      const result = await service.getTimeSlots();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.timeSlot.findMany).toHaveBeenCalledWith({
        orderBy: { startTime: 'asc' },
      });
    });
  });

  describe('updateTimeSlot', () => {
    it('should update a time slot', async () => {
      const updatedSlot = { ...mockTimeSlot, maxCapacity: 25 };
      mockPrismaService.timeSlot.update.mockResolvedValue(updatedSlot);

      const result = await service.updateTimeSlot('slot-1', { maxCapacity: 25 });

      expect(result.maxCapacity).toBe(25);
      expect(mockPrismaService.timeSlot.update).toHaveBeenCalledWith({
        where: { id: 'slot-1' },
        data: { maxCapacity: 25 },
      });
    });
  });

  describe('getContentBlocks', () => {
    it('should return all content blocks', async () => {
      mockPrismaService.contentBlock.findMany.mockResolvedValue([
        mockContentBlock,
      ]);

      const result = await service.getContentBlocks();

      expect(result).toHaveLength(1);
    });
  });

  describe('updateContentBlock', () => {
    it('should upsert a content block', async () => {
      mockPrismaService.contentBlock.upsert.mockResolvedValue(mockContentBlock);

      const result = await service.updateContentBlock(
        'home_hero',
        'Nuevo Título',
        'Nuevo contenido',
      );

      expect(result).toEqual(mockContentBlock);
      expect(mockPrismaService.contentBlock.upsert).toHaveBeenCalledWith({
        where: { slug: 'home_hero' },
        update: { title: 'Nuevo Título', content: 'Nuevo contenido' },
        create: {
          slug: 'home_hero',
          title: 'Nuevo Título',
          content: 'Nuevo contenido',
        },
      });
    });
  });
});
