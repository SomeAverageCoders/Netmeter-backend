import { Controller, Body, Req, Post, Param } from '@nestjs/common';
import { CreateGroupDto } from './create-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

 @Post(':creatorId')
  async createGroup(
    @Body() dto: CreateGroupDto,
    @Param('creatorId') creatorId: number,
  ) {
    return this.groupsService.createGroup(dto, +creatorId);
  }
}
