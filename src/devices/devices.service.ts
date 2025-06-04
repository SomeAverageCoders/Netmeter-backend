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
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group)
      throw new NotFoundException(`Group with id ${groupId} not found`);

    // Check if device already exists for the user
    let device = await this.deviceRepo.findOne({
      where: {
        macAddress: mac,
        owner: { id: userId },
      },
      relations: ['groups', 'owner'],
    });

    if (!device) {
      // If device doesn't exist, create new device with the group
      device = this.deviceRepo.create({
        name,
        macAddress: mac,
        owner: user,
        groups: [group],
      });
    } else {
      // Check if group is already associated with this device
      const isGroupAlreadyAssociated = device.groups?.some(g => g.id === groupId);
      if (!isGroupAlreadyAssociated) {
        // Initialize groups array if it doesn't exist
        if (!device.groups) {
          device.groups = [];
        }
        device.groups.push(group);
      } else {
        // Device is already in this group, just return it
        return device;
      }
    }

    return this.deviceRepo.save(device);
  }

  async getDevicesByGroup(groupId: number): Promise<Device[]> {
    return this.deviceRepo
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.owner', 'owner')
      .leftJoinAndSelect('device.groups', 'group')
      .where('group.id = :groupId', { groupId })
      .getMany();
  }


  async removeDeviceFromGroup(
    userId: number,
    deviceId: number,
    groupId: number,
  ): Promise<{ message: string }> {
    // First verify the device belongs to the user
    const device = await this.deviceRepo.findOne({
      where: {
        id: deviceId,
        owner: { id: userId },
      },
      relations: ['owner'],
    });

    if (!device) {
      throw new NotFoundException(
        'Device not found or does not belong to the user',
      );
    }

    // Check if the device-group relationship exists
    const existingRelation = await this.deviceRepo
      .createQueryBuilder('device')
      .innerJoin('device.groups', 'group')
      .where('device.id = :deviceId', { deviceId })
      .andWhere('group.id = :groupId', { groupId })
      .andWhere('device.owner.id = :userId', { userId })
      .getOne();

    if (!existingRelation) {
      throw new NotFoundException(
        `Device ${deviceId} is not associated with group ${groupId}`,
      );
    }

    // Remove the relationship using TypeORM's relation manager
    await this.deviceRepo.manager
      .createQueryBuilder()
      .relation(Device, 'groups')
      .of(deviceId)
      .remove(groupId);

    return { message: `Device ${deviceId} removed from group ${groupId}` };
  }

  // Additional helper methods for many-to-many relationship
  async getDeviceWithGroups(deviceId: number, userId: number): Promise<Device> {
    const device = await this.deviceRepo.findOne({
      where: {
        id: deviceId,
        owner: { id: userId },
      },
      relations: ['groups', 'owner'],
    });

    if (!device) {
      throw new NotFoundException('Device not found or does not belong to the user');
    }

    return device;
  }

  async getDevicesByUser(userId: number): Promise<Device[]> {
    return this.deviceRepo.find({
      where: { owner: { id: userId } },
      relations: ['groups', 'owner'],
    });
  }
}