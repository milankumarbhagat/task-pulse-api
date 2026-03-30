import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsInt()
    userId: number;
}