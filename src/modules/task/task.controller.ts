import { Controller, Get, Post, Body } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TaskController {
    constructor(private taskService: TaskService) { }

    @Post()
    create(@Body() dto: CreateTaskDto) {
        return this.taskService.create(dto);
    }

    @Get()
    findAll() {
        return this.taskService.findAll();
    }
}