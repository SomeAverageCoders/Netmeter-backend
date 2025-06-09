import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Device } from 'src/devices/device.entity';
import { Group } from 'src/groups/group.entity';

@Entity('device_usage')
export class DeviceUsage {
  @PrimaryGeneratedColumn()
  id: number;

@ManyToOne(() => Device, { nullable: false })
@JoinColumn({ name: 'device_id' })
device: Device;

@ManyToOne(() => Group, { nullable: false })
@JoinColumn({ name: 'group_id' })
group: Group;

  @Column({ type: 'date' })
  usage_date: Date;

  @Column()
  ssid: string;

  @Column('decimal', { precision: 20, scale: 2 })
  download_bytes: number;

  @Column('decimal', { precision: 20, scale: 2 })
  upload_bytes: number;
}
