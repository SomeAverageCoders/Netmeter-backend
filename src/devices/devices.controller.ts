import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('add')
  addDevice(
    @Body()
    body: {
      userId: number;
      groupId: number;
      name: string;
      macAddress: string;
    },
  ) {
    return this.devicesService.addDeviceToGroup(
      body.userId,
      body.groupId,
      body.name,
      body.macAddress,
    );
  }

  @Get('group/:groupId')
  getDevices(@Param('groupId') groupId: number) {
    return this.devicesService.getDevicesByGroup(+groupId);
  }
}
