import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ example: true, description: '¿El niño almuerza?' })
  @IsOptional()
  @IsBoolean()
  hasLunch?: boolean;

  @ApiPropertyOptional({ example: true, description: '¿Hay que ir a buscar al niño?' })
  @IsOptional()
  @IsBoolean()
  hasPickup?: boolean;

  @ApiPropertyOptional({ example: '12:50', description: 'Hora del traslado' })
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiPropertyOptional({ example: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}
