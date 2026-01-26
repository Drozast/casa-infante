import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @ApiProperty({ example: 'clxyz123...' })
  @IsString()
  childId: string;

  @ApiPropertyOptional({ example: 'clxyz456...' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ example: 'Llegó con su mamá' })
  @IsOptional()
  @IsString()
  notes?: string;
}
