import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('resendApiKey'));
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string) {
    const resetLink = `${this.configService.get<string>('frontendUrl')}/reset-password?token=${token}`;
    const fromEmail = (this.configService.get<boolean>('resendUseCustomDomain') 
      ? this.configService.get<string>('resendFromEmail') 
      : 'Task Pulse <onboarding@resend.dev>') || 'onboarding@resend.dev';

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Reset your Task Pulse password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Task Pulse</h2>
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">&copy; 2026 Task Pulse. Design your workflow, effortlessly.</p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send reset email');
    }
  }

  async sendOverdueTasksEmail(email: string, firstName: string, tasks: { title: string, dueDate: Date }[]) {
    const fromEmail = (this.configService.get<boolean>('resendUseCustomDomain') 
      ? this.configService.get<string>('resendFromEmail') 
      : 'Task Pulse <onboarding@resend.dev>') || 'onboarding@resend.dev';

    const tasksListHtml = tasks.map(t => `<li style="margin-bottom: 10px;"><strong>${t.title}</strong><br/>Due: ${new Date(t.dueDate).toLocaleDateString()}</li>`).join('');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'You have overdue tasks in Task Pulse',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Task Pulse</h2>
            <p>Hi ${firstName},</p>
            <p>You have ${tasks.length} overdue task(s) that need your attention:</p>
            <ul style="list-style-type: none; padding: 0;">
              ${tasksListHtml}
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.configService.get<string>('frontendUrl')}/tasks" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Tasks</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">&copy; ${new Date().getFullYear()} Task Pulse. Design your workflow, effortlessly.</p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send overdue tasks email');
    }
  }
}
