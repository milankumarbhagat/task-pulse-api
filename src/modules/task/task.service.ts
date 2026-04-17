import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) { }

    create(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                dueDate: new Date(createTaskDto.dueDate), // ensure dueDate is a JS Date for Prisma
            },
        });
    }

    findAll(userId: number) {
        return this.prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        const task = await this.prisma.task.findFirst({
            where: { id, userId },
        });
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }

    async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
        // Find first to ensure task exists and belongs to user
        await this.findOne(id, userId);
        
        return this.prisma.task.update({
            where: { id },
            data: {
                ...updateTaskDto,
                dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
            },
        });
    }

    async remove(id: number, userId: number) {
        // Find first to ensure task exists and belongs to user
        await this.findOne(id, userId);

        return this.prisma.task.delete({
            where: { id },
        });
    }
}