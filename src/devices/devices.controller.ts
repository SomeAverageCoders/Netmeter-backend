import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Public } from 'src/public.decorator';

@Public()
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

  @Delete(':deviceId/group/:groupId/user/:userId')
  removeDeviceFromGroup(
    @Param('deviceId') deviceId: number,
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    return this.devicesService.removeDeviceFromGroup(userId, deviceId, groupId);
  }

  // Additional endpoints for many-to-many functionality
  @Get(':deviceId/user/:userId')
  getDeviceWithGroups(
    @Param('deviceId') deviceId: number,
    @Param('userId') userId: number,
  ) {
    return this.devicesService.getDeviceWithGroups(deviceId, userId);
  }

  @Get('user/:userId')
  getDevicesByUser(@Param('userId') userId: number) {
    return this.devicesService.getDevicesByUser(userId);
  }
}