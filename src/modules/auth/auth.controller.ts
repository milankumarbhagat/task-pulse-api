import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('verify')
    verify(@Body('token') token: string) {
        return this.authService.verifyToken(token);
    }

    @Post('check-email')
    checkEmail(@Body('email') email: string) {
        return this.authService.userEmailExists(email);
    }

    @Post('google')
    googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto);
    }
}