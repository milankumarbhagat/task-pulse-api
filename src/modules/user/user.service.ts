import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.user.findMany();
    }

    create(dto: CreateUserDto) {
        const { confirmPassword, ...userData } = dto;
        return this.prisma.user.create({
            data: userData,
        });
    }

    findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { tasks: true },
        });
    }

    update(id: number, dto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: dto,
        });
    }

    remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
