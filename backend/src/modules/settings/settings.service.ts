import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.systemSettings.findMany();
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  async get(key: string) {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }

    return setting.value;
  }

  async set(key: string, value: unknown, userId: string) {
    return this.prisma.systemSettings.upsert({
      where: { key },
      update: { value: value as object, updatedById: userId },
      create: { key, value: value as object, updatedById: userId },
    });
  }

  async getPricingConfigs() {
    return this.prisma.pricingConfig.findMany({
      where: { isActive: true },
      orderBy: { weeklyFrequency: 'asc' },
    });
  }

  async updatePricingConfig(
    weeklyFrequency: number,
    pricePerSession: number,
    userId: string,
  ) {
    return this.prisma.pricingConfig.upsert({
      where: { weeklyFrequency },
      update: { pricePerSession },
      create: { weeklyFrequency, pricePerSession },
    });
  }

  async getDiscountConfigs() {
    return this.prisma.discountConfig.findMany({
      where: { isActive: true },
    });
  }

  async getTimeSlots() {
    return this.prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async updateTimeSlot(
    id: string,
    data: { name?: string; startTime?: string; endTime?: string; maxCapacity?: number; isActive?: boolean },
  ) {
    return this.prisma.timeSlot.update({
      where: { id },
      data,
    });
  }

  async getContentBlocks() {
    return this.prisma.contentBlock.findMany();
  }

  async updateContentBlock(slug: string, title: string, content: string) {
    return this.prisma.contentBlock.upsert({
      where: { slug },
      update: { title, content },
      create: { slug, title, content },
    });
  }
}
