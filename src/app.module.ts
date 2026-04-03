import { ConfigModule } from '@nestjs/config';
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
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { AppController } from './app.controller';


import { LoggerService } from './common/logger/logger.service';

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
  ],
  controllers: [AppController],
  providers: [LoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}