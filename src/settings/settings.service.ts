import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: number) {
    let settings = await this.prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSetting.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: number, data: any) {
    // Prevent updating userId
    const { userId: _, id: __, ...updateData } = data;
    
    return this.prisma.userSetting.upsert({
      where: { userId },
      update: updateData,
      create: { ...updateData, userId },
    });
  }
}
