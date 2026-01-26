import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
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
  @ApiOperation({ summary: 'Registrar entrada' })
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

  @Get('child/:childId')
  @ApiOperation({ summary: 'Historial de asistencia de un niño' })
  async getChildHistory(
    @Param('childId') childId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.getChildAttendanceHistory(childId, page, limit);
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
}
