import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Device } from 'src/devices/device.entity';
// Update the path below to the correct relative path if 'wifi-config.entity.ts' is in 'src/wifi'
import { WifiConfiguration } from 'src/wifi/wifi-config.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.id)
  admin: User;

  @ManyToMany(() => User, user => user.groups)
  @JoinTable()
  members: User[];

  @ManyToMany(() => Device, device => device.groups)
  devices: Device[];

  @OneToOne(() => WifiConfiguration, config => config.group, { cascade: true })
  @JoinColumn()
  wifiConfig: WifiConfiguration;
}
