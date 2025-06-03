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

  @Column()
  dataQuota: string;

  @Column()
  status: boolean;

  @Column()
  dailyUsageLimitPerMember: string;

  @OneToOne(() => Group, group => group.wifiConfig)
  group: Group;
}
