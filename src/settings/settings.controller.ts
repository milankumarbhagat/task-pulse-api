import { Controller, Get, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@Req() req: any) {
    return this.settingsService.getSettings(+req.user.sub);
  }

  @Patch()
  updateSettings(@Req() req: any, @Body() data: UpdateSettingDto) {
    return this.settingsService.updateSettings(+req.user.sub, data);
  }
}
