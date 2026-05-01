import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskCronService } from './task-cron.service';
import { TaskProcessor } from './task.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
    BullBoardModule.forFeature({
      name: 'emailQueue',
      adapter: BullAdapter,
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskCronService, TaskProcessor],
})
export class TaskModule { }