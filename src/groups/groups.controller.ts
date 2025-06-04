import { Controller, Body, Req, Post, Param, Get, ParseIntPipe, Delete  } from '@nestjs/common';
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

  @Get(':groupId/members-with-devices')
  async getGroupMembersWithDevices(@Param('groupId') groupId: number) {
    return this.groupsService.getGroupMembersWithDevices(+groupId);
  }

  @Post(':groupId/add-member/:memberId')
  async addMemberToGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number
  ) {
    return this.groupsService.addMemberToGroup(groupId, memberId);
  }

  @Delete(':groupId/remove-member/:memberId')
  async removeMemberFromGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.groupsService.removeMemberFromGroup(groupId, memberId);
  }

}
