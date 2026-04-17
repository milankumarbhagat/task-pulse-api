import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
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
