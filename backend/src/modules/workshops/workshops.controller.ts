import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('workshops')
@Controller('workshops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar talleres' })
  async findAll() {
    return this.workshopsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener taller por ID' })
  async findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear taller (Admin)' })
  async create(@Body() dto: CreateWorkshopDto) {
    return this.workshopsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar taller (Admin)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateWorkshopDto>) {
    return this.workshopsService.update(id, dto);
  }

  @Post(':id/enroll/:childId')
  @ApiOperation({ summary: 'Inscribir niño en taller' })
  async enrollChild(
    @Param('id') workshopId: string,
    @Param('childId') childId: string,
  ) {
    return this.workshopsService.enrollChild(workshopId, childId);
  }

  @Delete(':id/enroll/:childId')
  @ApiOperation({ summary: 'Desinscribir niño del taller' })
  async unenrollChild(
    @Param('id') workshopId: string,
    @Param('childId') childId: string,
  ) {
    return this.workshopsService.unenrollChild(workshopId, childId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar taller (Admin)' })
  async delete(@Param('id') id: string) {
    return this.workshopsService.delete(id);
  }
}
