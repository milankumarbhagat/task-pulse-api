import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateJobApplicationDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsOptional()
  companyWebsite?: string;

  @IsString()
  @IsOptional()
  salaryRange?: string;

  @IsString()
  @IsNotEmpty()
  portal: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsBoolean()
  @IsOptional()
  responseCame?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  resumeLink?: string;

  @IsDateString()
  @IsOptional()
  appliedDate?: string;

  @IsDateString()
  @IsOptional()
  interviewDate?: string;
}
