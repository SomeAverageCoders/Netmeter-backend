import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/groups/group.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async addDeviceToGroup(
    userId: number,
    groupId: number,
    name: string,
    mac: string,
  ): Promise<Device> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    const device = this.deviceRepo.create({
      name,
      macAddress: mac,
      owner: user,
      group,
    });

    return this.deviceRepo.save(device);
  }

  async getDevicesByGroup(groupId: number): Promise<Device[]> {
    return this.deviceRepo.find({
      where: { group: { id: groupId } },
      relations: ['owner', 'group'],
    });
  }
}