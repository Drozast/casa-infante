import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar boletas (Admin)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.findAll(page, limit);
  }

  @Get('my-invoices')
  @ApiOperation({ summary: 'Mis boletas' })
  async getMyInvoices(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.getMyInvoices(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener boleta por ID' })
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get('number/:invoiceNumber')
  @ApiOperation({ summary: 'Obtener boleta por número' })
  async findByNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findByNumber(invoiceNumber);
  }

  @Post('payment/:paymentId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar boleta para pago (Admin)' })
  async createInvoice(@Param('paymentId') paymentId: string) {
    return this.invoicesService.createInvoice(paymentId);
  }
}
