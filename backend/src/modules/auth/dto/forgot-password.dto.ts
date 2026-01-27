import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@ejemplo.cl' })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;
}
