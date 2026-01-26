import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class AddObservationDto {
  @ApiProperty({ example: 'Excelente comportamiento durante la clase de música' })
  @IsString()
  @MinLength(5)
  content: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
