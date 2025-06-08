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

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'helani123',
      database: 'Netmeter',
      autoLoadEntities: true,
      synchronize: true, 
    }),
      UsersModule,
      AuthModule,
      GroupsModule,
      DevicesModule,
      WifiModule,
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
