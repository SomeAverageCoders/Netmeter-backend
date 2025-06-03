import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

  @ManyToOne(() => User, user => user.devices, { eager: true })
  owner: User;

  @ManyToOne(() => Group, group => group.devices)
  group: Group;
}
