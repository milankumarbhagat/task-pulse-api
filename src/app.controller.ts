import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
  @Get()
  root() {
    return { message: 'Task Pulse API running 🚀' };
  }
}
