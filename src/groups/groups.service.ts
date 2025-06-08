import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateGroupDto } from './create-group.dto';
import { User } from 'src/users/user.entity';
import { Group } from './group.entity';
import { Device } from 'src/devices/device.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMemberDto } from './group-member.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async createGroup(dto: CreateGroupDto, creatorId: number): Promise<Group> {
    const creator = await this.userRepository.findOneBy({ id: creatorId });

    if (!creator) {
      throw new Error('Creator not found');
    }

    const members = await this.userRepository.findByIds(dto.memberIds);

    const group = this.groupRepository.create({
      name: dto.name,
      admin: creator,
      members: [...members, creator],
    });

    return this.groupRepository.save(group);
  }

  async getGroupsByUserId(userId: number): Promise<Group[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.groups;
  }

  async getGroupMembers(groupId: number): Promise<GroupMemberDto[]> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group.members.map((member) => ({
      id: member.id,
      name: member.name,
    }));
  }

  async getGroupMemberCount(groupId: number): Promise<number> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group.members.length;
  }

  async getGroupMembersWithDevices(groupId: number) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });
    
    if (!group) throw new Error('Group not found');

    // Get member IDs for filtering
    const memberIds = group.members.map(member => member.id);
    
    // Get devices that belong to this group AND are owned by group members
    const devices = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.owner', 'owner')
      .innerJoin('device.groups', 'deviceGroup') // Inner join to ensure device is in a group
      .where('deviceGroup.id = :groupId', { groupId }) // Device must be in this specific group
      .andWhere('owner.id IN (:...memberIds)', { memberIds }) // Device owner must be a group member
      .getMany();

    // Create a map of user devices
    const userDevicesMap = new Map();
    devices.forEach((device) => {
      if (!userDevicesMap.has(device.owner.id)) {
        userDevicesMap.set(device.owner.id, []);
      }
      userDevicesMap.get(device.owner.id).push({
        id: device.id,
        name: device.name,
        macAddress: device.macAddress,
      });
    });

    const members = group.members.map((member) => ({
      id: member.id,
      name: member.name,
      devices: userDevicesMap.get(member.id) || [],
    }));

    return {
      id: group.id,
      name: group.name,
      members,
    };
  }

  async addMemberToGroup(groupId: number, memberId: number, currentUser: any): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'admin'],
    });

    if (!group) throw new Error('Group not found');

    if (group.admin.id !== currentUser.userId) {
        throw new ForbiddenException('Only the group admin can add members');
    }

    const member = await this.userRepository.findOneBy({ id: memberId });
    if (!member) throw new Error('User not found');

    // Avoid duplicates
    const alreadyMember = group.members.some((m) => m.id === memberId);
    if (alreadyMember) return group;

    group.members.push(member);
    return this.groupRepository.save(group);
  }

  async removeMemberFromGroup(
    groupId: number,
    memberId: number,
    currentUser: any
  ): Promise<{ message: string }> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'admin'],
    });

    if (!group) throw new Error('Group not found');

    if (group.admin.id !== currentUser.userId) {
        throw new ForbiddenException('Only the group admin can remove members');
    }

    const member = await this.userRepository.findOneBy({ id: memberId });
    if (!member) throw new Error('User not found');

    // Remove the user from the group members
    group.members = group.members.filter((m) => m.id !== memberId);
    await this.groupRepository.save(group);

    // For many-to-many: Remove this specific group from all user's devices
    // First, get all devices owned by this user that are in this group
    const userDevicesInGroup = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.groups', 'group')
      .leftJoinAndSelect('device.owner', 'owner')
      .where('owner.id = :memberId', { memberId })
      .andWhere('group.id = :groupId', { groupId })
      .getMany();

    // Remove the group from each device (but keep the device and other groups)
    for (const device of userDevicesInGroup) {
      device.groups = device.groups.filter((g) => g.id !== groupId);
      await this.deviceRepository.save(device);
    }

    return {
      message: `User ${memberId} removed from group ${groupId} and devices removed from this group.`,
    };
  }
}

// import { Injectable } from '@nestjs/common';
// import { CreateGroupDto } from './create-group.dto';
// import { User } from 'src/users/user.entity';
// import { Group } from './group.entity';
// import { Device } from 'src/devices/device.entity';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
// import { GroupMemberDto } from './group-member.dto';

// @Injectable()
// export class GroupsService {
//   constructor(
//     @InjectRepository(Group)
//     private groupRepository: Repository<Group>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @InjectRepository(Device)
//     private deviceRepository: Repository<Device>,
//   ) {}

//   async createGroup(dto: CreateGroupDto, creatorId: number): Promise<Group> {
//     const creator = await this.userRepository.findOneBy({ id: creatorId });

//     if (!creator) {
//       throw new Error('Creator not found');
//     }

//     const members = await this.userRepository.findByIds(dto.memberIds);

//     const group = this.groupRepository.create({
//       name: dto.name,
//       admin: creator,
//       members: [...members, creator],
//     });

//     return this.groupRepository.save(group);
//   }

//   async getGroupsByUserId(userId: number): Promise<Group[]> {
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//       relations: ['groups'],
//     });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     return user.groups;
//   }

//   async getGroupMembers(groupId: number): Promise<GroupMemberDto[]> {
//     const group = await this.groupRepository.findOne({
//       where: { id: groupId },
//       relations: ['members'],
//     });

//     if (!group) {
//       throw new Error('Group not found');
//     }

//     return group.members.map((member) => ({
//       id: member.id,
//       name: member.name,
//     }));
//   }

//   async getGroupMemberCount(groupId: number): Promise<number> {
//     const group = await this.groupRepository.findOne({
//       where: { id: groupId },
//       relations: ['members'],
//     });

//     if (!group) {
//       throw new Error('Group not found');
//     }

//     return group.members.length;
//   }

//   async getGroupMembersWithDevices(groupId: number) {
//     const group = await this.groupRepository.findOne({
//       where: { id: groupId },
//       relations: ['members'],
//     });

//     if (!group) throw new Error('Group not found');

//     // Get devices for this specific group
//     const devices = await this.deviceRepository.find({
//       where: { group: { id: groupId } },
//       relations: ['owner', 'group'],
//     });

//     // Create a map of user devices
//     const userDevicesMap = new Map();
//     devices.forEach(device => {
//       if (!userDevicesMap.has(device.owner.id)) {
//         userDevicesMap.set(device.owner.id, []);
//       }
//       userDevicesMap.get(device.owner.id).push({
//         id: device.id,
//         name: device.name,
//         macAddress: device.macAddress,
//       });
//     });

//     const members = group.members.map(member => ({
//       id: member.id,
//       name: member.name,
//       devices: userDevicesMap.get(member.id) || [],
//     }));

//     return {
//       id: group.id,
//       name: group.name,
//       members,
//     };
//   }

//   async addMemberToGroup(groupId: number, memberId: number): Promise<Group> {
//     const group = await this.groupRepository.findOne({
//       where: { id: groupId },
//       relations: ['members'],
//     });

//     if (!group) throw new Error('Group not found');

//     const member = await this.userRepository.findOneBy({ id: memberId });
//     if (!member) throw new Error('User not found');

//     // Avoid duplicates
//     const alreadyMember = group.members.some(m => m.id === memberId);
//     if (alreadyMember) return group;

//     group.members.push(member);
//     return this.groupRepository.save(group);
//   }

//   async removeMemberFromGroup(groupId: number, memberId: number): Promise<{ message: string }> {
//     const group = await this.groupRepository.findOne({
//       where: { id: groupId },
//       relations: ['members'],
//     });

//     if (!group) throw new Error('Group not found');

//     const member = await this.userRepository.findOneBy({ id: memberId });
//     if (!member) throw new Error('User not found');

//     // Remove the user from the group members
//     group.members = group.members.filter((m) => m.id !== memberId);
//     await this.groupRepository.save(group);

//     // Delete all this user's devices under the group
//     const deviceRepository = this.groupRepository.manager.getRepository(Device);
//     await deviceRepository.delete({
//       owner: { id: memberId },
//       group: { id: groupId },
//     });

//     return {
//       message: `User ${memberId} removed from group ${groupId} and devices deleted.`,
//     };
//   }

// }
