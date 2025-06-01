import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './group.entity';
import { User } from 'src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:  [TypeOrmModule.forFeature([Group, User])],
  providers: [GroupsService],
  controllers: [GroupsController]
})
export class GroupsModule {}
