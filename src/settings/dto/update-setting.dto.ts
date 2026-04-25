import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  sidebarState?: string;

  @IsOptional()
  @IsObject()
  extraSettings?: any;
}
