import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Iniciar proceso de pago' })
  async createPayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, dto);
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Callback de Transbank (GET)' })
  async handleCallback(
    @Query('token_ws') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('frontend.url');

    try {
      const result = await this.paymentsService.processCallback(token);

      if (result.success) {
        return res.redirect(
          `${frontendUrl}/payments/success?order=${result.orderId}`,
        );
      } else {
        return res.redirect(
          `${frontendUrl}/payments/error?reason=${result.reason}`,
        );
      }
    } catch (error) {
      return res.redirect(`${frontendUrl}/payments/error?reason=unknown`);
    }
  }

  @Post('callback')
  @Public()
  @ApiOperation({ summary: 'Callback de Transbank (POST)' })
  async handleCallbackPost(
    @Body('token_ws') token: string,
    @Res() res: Response,
  ) {
    return this.handleCallback(token, res);
  }

  @Get('my-payments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mis pagos' })
  async getMyPayments(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.getPaymentsByGuardian(userId, page, limit);
  }

  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener pagos pendientes' })
  async getPendingPayments(@CurrentUser('sub') userId: string) {
    return this.paymentsService.getPendingPayments(userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de pago' })
  async getPayment(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.paymentsService.getPaymentById(id, user);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los pagos (Admin)' })
  async getAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.getAllPayments({
      page,
      limit,
      status,
      from,
      to,
    });
  }

  @Post(':id/refund')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reembolsar pago (Admin)' })
  async refundPayment(@Param('id') id: string) {
    return this.paymentsService.refundPayment(id);
  }
}
