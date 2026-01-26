import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildPreferencesDto } from './dto/child-preferences.dto';
import { AddObservationDto } from './dto/add-observation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('children')
@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Listar todos los niños (Admin/Staff)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.childrenService.findAll(page, limit, search);
  }

  @Get('my-children')
  @ApiOperation({ summary: 'Listar mis niños (Apoderado)' })
  async findMyChildren(@CurrentUser('sub') userId: string) {
    return this.childrenService.findByGuardian(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener niño por ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.childrenService.findOne(id, userId, userRole);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo niño' })
  async create(
    @CurrentUser('sub') guardianId: string,
    @Body() dto: CreateChildDto,
  ) {
    return this.childrenService.create(guardianId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar niño' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChildDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.childrenService.update(id, dto, userId, userRole);
  }

  @Put(':id/preferences')
  @ApiOperation({ summary: 'Actualizar preferencias del niño' })
  async updatePreferences(
    @Param('id') id: string,
    @Body() dto: ChildPreferencesDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.childrenService.updatePreferences(id, dto, userId, userRole);
  }

  @Post(':id/observations')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Agregar observación (Admin/Staff)' })
  async addObservation(
    @Param('id') childId: string,
    @Body() dto: AddObservationDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.childrenService.addObservation(
      childId,
      dto.content,
      userId,
      dto.isInternal ?? true,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar/Desactivar niño' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.childrenService.delete(id, userId, userRole);
  }
}
