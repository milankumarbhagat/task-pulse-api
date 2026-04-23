import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    description?: string;

    @IsDateString()
    dueDate: string | Date;

    @IsEnum(Priority)
    priority: Priority;

    @IsEnum(Status)
    status: Status;

    @IsInt()
    @IsOptional()
    userId!: number;
}
