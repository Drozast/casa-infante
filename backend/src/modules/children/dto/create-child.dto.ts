import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ example: 'Sofía' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '2020-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'Femenino' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Colegio San Patricio' })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({ example: 'Kinder' })
  @IsOptional()
  @IsString()
  schoolGrade?: string;

  @ApiPropertyOptional({ example: ['Maní', 'Mariscos'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: ['Asma leve'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @ApiPropertyOptional({ example: ['Salbutamol'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ example: 'María González' })
  @IsString()
  @MinLength(2)
  emergencyContactName: string;

  @ApiProperty({ example: '+56912345678' })
  @IsString()
  emergencyContactPhone: string;

  @ApiProperty({ example: 'Madre' })
  @IsString()
  emergencyContactRelation: string;

  @ApiPropertyOptional({ example: 'Prefiere comer frutas en el snack' })
  @IsOptional()
  @IsString()
  familyNotes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasSiblings?: boolean;

  @ApiPropertyOptional({ example: 'Hermano: Lucas (8 años)' })
  @IsOptional()
  @IsString()
  siblingsInfo?: string;
}
