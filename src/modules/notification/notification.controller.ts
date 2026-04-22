import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  @Post('subscribe')
  async subscribe(@Request() req, @Body() subscription: any) {
    const userId = req.user.sub;
    
    // Extract keys
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh,
        auth,
      },
      create: {
        userId,
        endpoint,
        p256dh,
        auth,
      },
    });
  }

  @Post('test')
  async sendTestNotification(@Request() req) {
    try {
      const userId = req.user.sub;
      console.log('Sending test notification for user:', userId);
      const subs = await this.prisma.pushSubscription.findMany({
        where: { userId }
      });

      console.log('Found subscriptions:', subs.length);

      if (subs.length === 0) {
        return { message: 'No subscriptions found for this user. Please allow notifications in your browser first.' };
      }

      for (const sub of subs) {
        console.log('Sending to sub:', sub.id);
        await this.notificationService.sendNotification(sub, {
          title: 'Test Notification!',
          body: 'This is a test notification from Task Pulse.',
          data: { test: true }
        });
      }

      return { 
        message: 'Test notification sent!', 
        subscriptionCount: subs.length 
      };
    } catch (error) {
      console.error('Error in sendTestNotification:', error);
      throw error;
    }
  }
}
