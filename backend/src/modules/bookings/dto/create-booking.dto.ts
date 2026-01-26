import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { PassType } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxyz123...' })
  @IsString()
  childId: string;

  @ApiProperty({ example: 'manana' })
  @IsString()
  slotId: string;

  @ApiProperty({ example: '2024-03-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: PassType, default: PassType.MONTHLY })
  @IsOptional()
  @IsEnum(PassType)
  passType?: PassType;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  weeklyFrequency?: number;

  @ApiPropertyOptional({ example: 'Prefiere actividades de música' })
  @IsOptional()
  @IsString()
  notes?: string;
}
