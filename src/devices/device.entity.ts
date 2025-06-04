import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Group } from 'src/groups/group.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  macAddress: string;

  @ManyToOne(() => User, (user) => user.devices, { eager: true })
  owner: User;

  @ManyToMany(() => Group, (group) => group.devices)
  @JoinTable({
    name: 'device_groups', // Custom junction table name
    joinColumn: { name: 'device_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  groups: Group[];
}
