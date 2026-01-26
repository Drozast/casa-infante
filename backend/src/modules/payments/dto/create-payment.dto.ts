import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'clxyz123...' })
  @IsString()
  bookingId: string;
}
