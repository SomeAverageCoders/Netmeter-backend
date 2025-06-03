import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './group.entity';
import { User } from 'src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from 'src/devices/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Device])],
  providers: [GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
