import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BillingType } from '@prisma/client';

export class CheckInDto {
  @ApiProperty({ example: 'clxyz123...' })
  @IsString()
  childId: string;

  @ApiPropertyOptional({ example: '2024-03-15', description: 'Fecha de asistencia (para registro retroactivo)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 'tarde' })
  @IsOptional()
  @IsString()
  slotId?: string;

  @ApiPropertyOptional({ example: 'clxyz456...' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ enum: BillingType, example: 'POSTPAID' })
  @IsOptional()
  @IsEnum(BillingType)
  billingType?: BillingType;

  @ApiPropertyOptional({ example: 'Llegó con su mamá' })
  @IsOptional()
  @IsString()
  notes?: string;
}
