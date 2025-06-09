import { Test, TestingModule } from '@nestjs/testing';
import { DeviceUsageService } from './device_usage.service';

describe('DeviceUsageService', () => {
  let service: DeviceUsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceUsageService],
    }).compile();

    service = module.get<DeviceUsageService>(DeviceUsageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
