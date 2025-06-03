import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/groups/group.entity';
import { WifiConfiguration } from './wifi-config.entity';
import { WifiController } from './wifi.controller';
import { WifiService } from './wifi.service';

@Module({
  imports: [TypeOrmModule.forFeature([WifiConfiguration, Group])],
  providers: [WifiService],
  controllers: [WifiController],
})
export class WifiModule {}
