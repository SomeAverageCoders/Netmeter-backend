import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { DevicesModule } from './devices/devices.module';
import { WifiModule } from './wifi/wifi.module';

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
  providers: [AppService],
})
export class AppModule {}
