import { Controller, Get, Post, Body, UseGuards, Req, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard) // 🔐 PROTECTED
export class TaskController {
    constructor(private taskService: TaskService) { }

    @Post()
    create(@Req() req: any, @Body() dto: CreateTaskDto) {
        console.log("\n\n req.user user==> ", req.user);
        dto.userId = req.user.sub;
        return this.taskService.create(dto);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.taskService.findAll(+req.user.sub);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.taskService.findOne(id, +req.user.sub);
    }

    @Put(':id')
    update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(id, +req.user.sub, updateTaskDto);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.taskService.remove(id, +req.user.sub);
    }
}