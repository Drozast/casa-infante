import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Estadísticas del dashboard' })
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Reporte de ingresos' })
  async getRevenueReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getRevenueReport(new Date(from), new Date(to));
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Reporte de asistencia' })
  async getAttendanceReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getAttendanceReport(new Date(from), new Date(to));
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Reporte de reservas' })
  async getBookingsReport(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getBookingsReport(new Date(from), new Date(to));
  }

  @Get('children')
  @ApiOperation({ summary: 'Reporte de niños' })
  async getChildrenReport() {
    return this.reportsService.getChildrenReport();
  }
}
