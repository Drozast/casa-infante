import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, BookingStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Listar todas las reservas (Admin/Staff)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingsService.findAll(page, limit, status, from, to);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Listar mis reservas' })
  async findMyBookings(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.findByGuardian(userId, page, limit);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtener próximas reservas' })
  async getUpcoming(@CurrentUser('sub') userId: string) {
    return this.bookingsService.getUpcoming(userId);
  }

  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Reservas de hoy (Staff)' })
  async getTodayBookings() {
    return this.bookingsService.getTodayBookings();
  }

  @Get('slots')
  @ApiOperation({ summary: 'Obtener horarios disponibles' })
  async getTimeSlots() {
    return this.bookingsService.getTimeSlots();
  }

  @Get('availability')
  @ApiOperation({ summary: 'Verificar disponibilidad' })
  async getAvailability(
    @Query('date') date: string,
    @Query('slotId') slotId?: string,
  ) {
    return this.bookingsService.getAvailability(date, slotId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.findOne(id, userId, userRole);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva reserva' })
  async create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, dto, userRole);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reserva' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.cancel(id, userId, userRole);
  }
}
