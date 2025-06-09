import { Module } from '@nestjs/common';
import { DeviceUsageController } from './device_usage.controller';
import { DeviceUsageService } from './device_usage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceUsage } from './device_usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceUsage])],
  controllers: [DeviceUsageController],
  providers: [DeviceUsageService]
})
export class DeviceUsageModule {}
