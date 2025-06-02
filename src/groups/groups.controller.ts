import { Controller, Body, Req, Post, Param, Get } from '@nestjs/common';
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

  @Get('get/:userId')
  async getGroupsByUserId(@Param('userId') userId: number) {
  return this.groupsService.getGroupsByUserId(+userId);
  }

  @Get(':groupId/members')
  async getGroupMembers(@Param('groupId') groupId: number) {
    return this.groupsService.getGroupMembers(+groupId);
  }

  @Get(':groupId/member-count')
  async getGroupMemberCount(@Param('groupId') groupId: number) {
    const count = await this.groupsService.getGroupMemberCount(+groupId);
    return { groupId, memberCount: count };
  }

}
