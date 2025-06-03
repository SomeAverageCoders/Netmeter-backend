import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from 'src/groups/group.entity';
import { Repository } from 'typeorm';
import { WifiConfiguration } from './wifi-config.entity';

@Injectable()
export class WifiService {
  constructor(
    @InjectRepository(WifiConfiguration)
    private wifiRepo: Repository<WifiConfiguration>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async updateWifi(groupId: number, data: Partial<WifiConfiguration>) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['wifiConfig'],
    });

    if (!group) throw new Error('Group not found');

    if (group.wifiConfig) {
      Object.assign(group.wifiConfig, data);
      return this.wifiRepo.save(group.wifiConfig);
    }

    const config = this.wifiRepo.create({ ...data, group });
    group.wifiConfig = config;
    await this.groupRepo.save(group);
    return config;
  }

  async getWifiByGroup(groupId: number) {
    return this.wifiRepo.findOne({ where: { group: { id: groupId } } });
  }
}
