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

    async getAnalytics(userId: number, timeframe: string = '7d') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        let startDate: Date | undefined;
        let daysToTrack = 7;

        if (timeframe === '7d') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            daysToTrack = 7;
        } else if (timeframe === '30d') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
            daysToTrack = 30;
        } else if (timeframe === 'all') {
            // For 'all', we don't filter completed tasks by date, but we still want a sensible trend chart (e.g. 30 days)
            startDate = undefined;
            daysToTrack = 30;
        }

        const trendStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysToTrack - 1));

        const completedWhere: any = { userId, status: 'COMPLETED' };
        if (startDate) {
            completedWhere.updatedAt = { gte: startDate };
        }

        const [
            totalTasks,
            completedTasks,
            overdueTasks,
            tasksDueToday,
            tasksByPriority,
            tasksByStatus,
            recentCompletedTasks
        ] = await Promise.all([
            this.prisma.task.count({ where: { userId } }),
            this.prisma.task.count({ where: completedWhere }),
            this.prisma.task.count({ where: { userId, status: { not: 'COMPLETED' }, dueDate: { lt: now } } }),
            this.prisma.task.count({ where: { userId, status: { not: 'COMPLETED' }, dueDate: { gte: startOfToday, lte: endOfToday } } }),
            this.prisma.task.groupBy({ by: ['priority'], where: { userId }, _count: true }),
            this.prisma.task.groupBy({ by: ['status'], where: { userId }, _count: true }),
            this.prisma.task.findMany({
                where: {
                    userId,
                    status: 'COMPLETED',
                    updatedAt: { gte: trendStartDate }
                },
                select: { updatedAt: true }
            })
        ]);

        const completedTrend: { date: string; count: number }[] = [];
        for (let i = daysToTrack - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            completedTrend.push({ date: dateString, count: 0 });
        }

        recentCompletedTasks.forEach(task => {
            const dateString = task.updatedAt.toISOString().split('T')[0];
            const trendEntry = completedTrend.find(t => t.date === dateString);
            if (trendEntry) {
                trendEntry.count++;
            }
        });

        return {
            totalTasks,
            completedTasks,
            overdueTasks,
            tasksDueToday,
            tasksByPriority: tasksByPriority.map(p => ({ priority: p.priority, count: p._count })),
            tasksByStatus: tasksByStatus.map(s => ({ status: s.status, count: s._count })),
            completedTrend
        };
    }
}