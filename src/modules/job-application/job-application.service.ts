import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createDto: CreateJobApplicationDto) {
    const { appliedDate, interviewDate, ...rest } = createDto;

    return this.prisma.jobApplication.create({
      data: {
        ...rest,
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const jobApp = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!jobApp) {
      throw new NotFoundException(`Job Application with ID ${id} not found`);
    }

    return jobApp;
  }

  async update(userId: number, id: number, updateDto: UpdateJobApplicationDto) {
    await this.findOne(userId, id); // Ensure strict ownership

    const { appliedDate, interviewDate, ...rest } = updateDto;

    const data: any = { ...rest };
    if (appliedDate !== undefined) {
      data.appliedDate = appliedDate ? new Date(appliedDate) : new Date();
    }
    if (interviewDate !== undefined) {
      data.interviewDate = interviewDate ? new Date(interviewDate) : null;
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id); // Ensure strict ownership

    return this.prisma.jobApplication.delete({
      where: { id },
    });
  }
}
