import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/groups/group.entity';
import { User } from 'src/users/user.entity';
import { Device } from './device.entity';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, User, Group])],
  providers: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
