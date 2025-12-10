import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { DevicesModule } from './devices/devices.module';
import { WifiModule } from './wifi/wifi.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-strategy/jwt-auth.guard';
import { DeviceUsageModule } from './device_usage/device_usage.module';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database-1.cxamcw6i0jpk.eu-north-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: 'Helloworld',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true, 
        ssl: {
    rejectUnauthorized: false, 
  },
    }),
      UsersModule,
      AuthModule,
      GroupsModule,
      DevicesModule,
      WifiModule,
      DeviceUsageModule,
  ],
  controllers: [AppController],
  providers: [AppService,
        {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
