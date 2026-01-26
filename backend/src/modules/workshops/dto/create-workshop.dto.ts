import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { WorkshopDay } from '@prisma/client';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Alemán' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Taller de idioma alemán para niños' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkshopDay, example: WorkshopDay.TUESDAY })
  @IsEnum(WorkshopDay)
  dayOfWeek: WorkshopDay;

  @ApiProperty({ example: '15:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '16:30' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  maxCapacity: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  additionalPrice?: number;
}
