import { Injectable } from '@nestjs/common';
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
    
    // Get devices for this specific group
    const devices = await this.deviceRepository.find({
      where: { group: { id: groupId } },
      relations: ['owner', 'group'],
    });
    
    // Create a map of user devices
    const userDevicesMap = new Map();
    devices.forEach(device => {
      if (!userDevicesMap.has(device.owner.id)) {
        userDevicesMap.set(device.owner.id, []);
      }
      userDevicesMap.get(device.owner.id).push({
        id: device.id,
        name: device.name,
      });
    });
    
    const members = group.members.map(member => ({
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

  async addMemberToGroup(groupId: number, memberId: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });

    if (!group) throw new Error('Group not found');

    const member = await this.userRepository.findOneBy({ id: memberId });
    if (!member) throw new Error('User not found');

    // Avoid duplicates
    const alreadyMember = group.members.some(m => m.id === memberId);
    if (alreadyMember) return group;

    group.members.push(member);
    return this.groupRepository.save(group);
  }

}
