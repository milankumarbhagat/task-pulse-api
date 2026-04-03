import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

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

    @IsString()
    @MinLength(6)
    password: string;
}