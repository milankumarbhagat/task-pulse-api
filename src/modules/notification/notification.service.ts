import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {
    webpush.setVapidDetails(
      'mailto:milan@email.com',
      'BBesHTe6RWwRl60iW8_zOfJSCsuq8OhNnMh-pjQ30MlXapGykAugItvYsL5YThuHA2CE34qp4CndTCEjzYIjy3k',
      'FWQ_efqz-2L35vxvLCqXTTZN5P6QuBgfQW7cA9ZzWkQ',
    );
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'checkTasksDueSoon' })
  async checkTasksDueSoon() {
    this.logger.log('Checking for tasks due soon...');
    const now = new Date();
    const soon = new Date();
    soon.setHours(soon.getHours() + 24); // 24 hours from now

    const tasks = await this.prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: {
          lte: soon,
          gt: now,
        },
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true,
          },
        },
      },
    });

    this.logger.log(`Found ${tasks.length} tasks due soon.`);

    for (const task of tasks) {
      for (const sub of task.user.pushSubscriptions) {
        await this.sendNotification(sub, {
          title: 'Task Due Soon!',
          body: `Your task "${task.title}" is due soon.`,
          data: { taskId: task.id },
        });
      }
    }
  }

  async sendNotification(subscription: any, payload: any) {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      this.logger.log(`Notification sent to subscription ${subscription.id}`);
    } catch (error) {
      if (error.statusCode === 410) {
        this.logger.warn(`Subscription ${subscription.id} expired, deleting...`);
        await this.prisma.pushSubscription.delete({ where: { id: subscription.id } });
      } else {
        this.logger.error('Error sending push notification', error);
      }
    }
  }
}
