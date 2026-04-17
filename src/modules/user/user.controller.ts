import { Body, Controller, Post, Get, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get('me')
    getProfile(@Request() req: any) {
        return this.userService.findOne(req.user.sub);
    }

    @Put('me')
    updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.sub, dto);
    }
}
