import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Group } from 'src/groups/group.entity';

@Entity()
export class WifiConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  networkName: string;

  @Column()
  ssid: string;

  @Column('decimal', { precision: 20, scale: 2 })
  dataQuota: number;

  @Column()
  status: boolean;

  @Column('decimal', { precision: 20, scale: 2 })
  dailyUsageLimitPerMember: number;

  @OneToOne(() => Group, group => group.wifiConfig)
  group: Group;
}
