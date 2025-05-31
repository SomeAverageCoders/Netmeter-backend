import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/user.dto';
import { User } from './user.entity';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';


@Controller('users')
export class UsersController {
      constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(dto);
  }

    @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<string> {
    return this.usersService.verifyOtp(dto);
  }
}
