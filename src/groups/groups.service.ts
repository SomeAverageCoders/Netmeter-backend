import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './create-group.dto';
import { User } from 'src/users/user.entity';
import { Group } from './group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
}
