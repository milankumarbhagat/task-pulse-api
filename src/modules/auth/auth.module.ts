import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RecaptchaService } from './recaptcha.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1y' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RecaptchaService],
})
export class AuthModule { }