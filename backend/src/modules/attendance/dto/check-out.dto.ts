import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CheckOutDto {
  @ApiProperty({ example: 'clxyz789...' })
  @IsString()
  attendanceId: string;

  @ApiPropertyOptional({ example: 'Recogido por el papá' })
  @IsOptional()
  @IsString()
  notes?: string;
}
