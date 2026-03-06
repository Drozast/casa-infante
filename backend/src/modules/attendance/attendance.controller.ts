import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, PaymentStatus } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Listar registros de asistencia' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findAll(page, limit, from, to);
  }

  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Asistencia de hoy' })
  async getTodayAttendance() {
    return this.attendanceService.getTodayAttendance();
  }

  @Post('check-in')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Registrar entrada (soporta fecha retroactiva)' })
  async checkIn(
    @CurrentUser('sub') staffId: string,
    @Body() dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(staffId, dto);
  }

  @Post('check-out')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Registrar salida' })
  async checkOut(
    @CurrentUser('sub') staffId: string,
    @Body() dto: CheckOutDto,
  ) {
    return this.attendanceService.checkOut(staffId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar registro de asistencia' })
  async deleteAttendance(@Param('id') id: string) {
    return this.attendanceService.deleteAttendance(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Actualizar registro de asistencia (almuerzo, traslado)' })
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(id, dto);
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Historial de asistencia de un niño' })
  async getChildHistory(
    @Param('childId') childId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.getChildAttendanceHistory(childId, page, limit);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CALENDARIO MENSUAL (Vista "Cartulina")
  // ═══════════════════════════════════════════════════════════════════

  @Get('calendar/:childId/:year/:month')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Calendario mensual de asistencia de un niño' })
  async getMonthlyCalendar(
    @Param('childId') childId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.attendanceService.getMonthlyCalendar(childId, +month, +year);
  }

  // ═══════════════════════════════════════════════════════════════════
  // COBROS MENSUALES
  // ═══════════════════════════════════════════════════════════════════

  @Get('billing')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar cobros mensuales' })
  async getMonthlyBillings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.attendanceService.getMonthlyBillings(
      page,
      limit,
      status,
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  @Get('billing/pending/:year/:month')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Niños con asistencias pendientes de cobro' })
  async getChildrenWithPendingBilling(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.attendanceService.getChildrenWithPendingBilling(+month, +year);
  }

  @Post('billing/generate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar cobro mensual para un niño' })
  async generateMonthlyBilling(
    @Body() body: { childId: string; month: number; year: number },
  ) {
    return this.attendanceService.generateMonthlyBilling(
      body.childId,
      body.month,
      body.year,
    );
  }

  @Post('billing/:id/pay')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Marcar cobro como pagado' })
  async markBillingAsPaid(
    @Param('id') id: string,
    @Body() body: { method: string },
  ) {
    return this.attendanceService.markBillingAsPaid(id, body.method);
  }

  @Get('report')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reporte de asistencia' })
  async getReport(@Query('from') from: string, @Query('to') to: string) {
    return this.attendanceService.getAttendanceReport(
      new Date(from),
      new Date(to),
    );
  }

  @Get('calendar-events')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Eventos de calendario (formato FullCalendar)' })
  async getCalendarEvents(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.attendanceService.getCalendarEvents(from, to);
  }
}
