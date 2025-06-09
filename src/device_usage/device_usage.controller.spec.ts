import { Test, TestingModule } from '@nestjs/testing';
import { DeviceUsageController } from './device_usage.controller';

describe('DeviceUsageController', () => {
  let controller: DeviceUsageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceUsageController],
    }).compile();

    controller = module.get<DeviceUsageController>(DeviceUsageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
