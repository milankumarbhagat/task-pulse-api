import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Post()
  create(@Req() req: any, @Body() createDto: CreateJobApplicationDto) {
    const userId = +req.user.sub;
    return this.jobApplicationService.create(userId, createDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = +req.user.sub;
    return this.jobApplicationService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = +req.user.sub;
    return this.jobApplicationService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateJobApplicationDto,
  ) {
    const userId = +req.user.sub;
    return this.jobApplicationService.update(userId, id, updateDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = +req.user.sub;
    return this.jobApplicationService.remove(userId, id);
  }
}
