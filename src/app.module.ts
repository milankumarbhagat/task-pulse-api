import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
// import { DatabaseModule } from './database/database.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { AuthModule } from './modules/auth/auth.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { AppController } from './app.controller';
import { NotificationModule } from './modules/notification/notification.module';
import { MailModule } from './modules/mail/mail.module';


import { LoggerModule } from './common/logger/logger.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // DatabaseModule,
    PrismaModule,
    UserModule,
    TaskModule,
    AuthModule,
    NotificationModule,
    MailModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          const url = new URL(redisUrl);
          return {
            redis: {
              host: url.hostname,
              port: Number(url.port),
              username: url.username || undefined,
              password: url.password || undefined,
              tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
            },
          };
        }
        return {
          redis: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    SettingsModule,
    LoggerModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}