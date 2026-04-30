import { IsEmail, IsString, MaxLength, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    firstName: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    lastName: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    occupation?: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    recaptchaToken: string;
}