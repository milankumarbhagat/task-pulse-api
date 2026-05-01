import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { Status } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class TaskCronService implements OnModuleInit {
  private readonly logger = new Logger(TaskCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('emailQueue') private emailQueue: Queue,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) { }

  onModuleInit() {
    const cronTime = this.configService.get<string>('OVERDUE_EMAIL_CRON', '0 5 * * *');
    
    try {
      const job = new CronJob(cronTime, () => {
        this.handleOverdueTasks();
      });
      this.schedulerRegistry.addCronJob('overdue-tasks-check', job);
      job.start();
      this.logger.log(`Cron job scheduled with expression: ${cronTime}`);
    } catch (error) {
      this.logger.error(`Failed to schedule cron job. Invalid cron expression: ${cronTime}`);
    }
  }

  async handleOverdueTasks() {
    this.logger.debug('Running overdue tasks check');

    const now = new Date();

    // Find users with overdue tasks
    const usersWithOverdueTasks = await this.prisma.user.findMany({
      where: {
        tasks: {
          some: {
            dueDate: {
              lt: now, // overdue
            },
            status: {
              notIn: [Status.COMPLETED], // not completed
            },
          },
        },
      },
      include: {
        tasks: {
          where: {
            dueDate: {
              lt: now,
            },
            status: {
              notIn: [Status.COMPLETED],
            },
          },
        },
      },
    });

    this.logger.debug(`Found ${usersWithOverdueTasks.length} users with overdue tasks`);

    for (const user of usersWithOverdueTasks) {
      if (user.tasks.length > 0) {
        try {
          await this.emailQueue.add('send-overdue', {
            userId: user.id,
          }, {
            attempts: 3, // Retry up to 3 times on failure
            backoff: {
              type: 'exponential',
              delay: 60000, // 1 minute base delay
            },
            removeOnComplete: true, // Automatically remove completed jobs to save Redis memory
          });
          this.logger.debug(`Queued overdue tasks email job for user ${user.id}`);
        } catch (error) {
          this.logger.error(`Failed to queue email job for user ${user.id}`, error);
        }
      }
    }
  }
}
