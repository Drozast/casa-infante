import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener configuraciones (Admin)' })
  async getAll() {
    return this.settingsService.getAll();
  }

  @Put(':key')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración (Admin)' })
  async set(
    @Param('key') key: string,
    @Body('value') value: unknown,
    @CurrentUser('sub') userId: string,
  ) {
    return this.settingsService.set(key, value, userId);
  }

  @Get('pricing')
  @Public()
  @ApiOperation({ summary: 'Obtener precios' })
  async getPricing() {
    return this.settingsService.getPricingConfigs();
  }

  @Put('pricing/:frequency')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar precio (Admin)' })
  async updatePricing(
    @Param('frequency') frequency: string,
    @Body('pricePerSession') price: number,
    @CurrentUser('sub') userId: string,
  ) {
    return this.settingsService.updatePricingConfig(
      parseInt(frequency),
      price,
      userId,
    );
  }

  @Get('discounts')
  @Public()
  @ApiOperation({ summary: 'Obtener descuentos' })
  async getDiscounts() {
    return this.settingsService.getDiscountConfigs();
  }

  @Get('time-slots')
  @Public()
  @ApiOperation({ summary: 'Obtener horarios' })
  async getTimeSlots() {
    return this.settingsService.getTimeSlots();
  }

  @Put('time-slots/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar horario (Admin)' })
  async updateTimeSlot(
    @Param('id') id: string,
    @Body() data: { name?: string; startTime?: string; endTime?: string; maxCapacity?: number; isActive?: boolean },
  ) {
    return this.settingsService.updateTimeSlot(id, data);
  }

  @Get('content')
  @Public()
  @ApiOperation({ summary: 'Obtener bloques de contenido' })
  async getContent() {
    return this.settingsService.getContentBlocks();
  }

  @Put('content/:slug')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar contenido (Admin)' })
  async updateContent(
    @Param('slug') slug: string,
    @Body() data: { title: string; content: string },
  ) {
    return this.settingsService.updateContentBlock(slug, data.title, data.content);
  }
}
