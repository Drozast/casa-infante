import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ChildPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  physicalActivity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  musicReinforcement?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  socialDevelopment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  germanLanguage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  englishLanguage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPlan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
