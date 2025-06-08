import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { WifiConfiguration } from './wifi-config.entity';
import { WifiService } from './wifi.service';
import { Public } from 'src/public.decorator';

@Public()
@Controller('wifi')
export class WifiController {
  constructor(private wifiService: WifiService) {}

  @Post(':groupId')
  updateWifi(
    @Param('groupId') groupId: number,
    @Body() body: Partial<WifiConfiguration>,
  ) {
    return this.wifiService.updateWifi(+groupId, body);
  }

  @Get(':groupId')
  getWifi(@Param('groupId') groupId: number) {
    return this.wifiService.getWifiByGroup(+groupId);
  }
}
