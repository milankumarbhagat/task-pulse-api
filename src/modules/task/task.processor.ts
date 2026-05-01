import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Status } from '@prisma/client';

@Processor('emailQueue')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Process({ name: 'send-overdue', concurrency: 1 })
  async handleSendOverdueEmail(job: Job<{ userId: number }>) {
    this.logger.debug(`Processing job ${job.id} for user ${job.data.userId}`);
    const { userId } = job.data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: {
          where: {
            dueDate: { lt: new Date() },
            status: { notIn: [Status.COMPLETED] },
          },
        },
      },
    });

    if (user && user.tasks.length > 0) {
      try {
        await this.mailService.sendOverdueTasksEmail(user.email, user.firstName, user.tasks);
        this.logger.debug(`Successfully sent overdue tasks email to ${user.email}`);
      } catch (error) {
        this.logger.error(`Failed to send overdue tasks email to ${user.email}`, error);
        throw error; // Let Bull retry the job
      }
    } else {
      this.logger.debug(`No overdue tasks found for user ${userId} at processing time.`);
    }
  }
}
