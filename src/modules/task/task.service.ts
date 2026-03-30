import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) { }

    create(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: createTaskDto,
        });
    }

    findAll() {
        return this.prisma.task.findMany({
            include: { user: true },
        });
    }
}