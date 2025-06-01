import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto , LoginUserDto} from 'src/dto/user.dto';
import { User } from './user.entity';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
      constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    var savedUser = this.usersService.createUser(dto)
    return plainToInstance(User, savedUser); 
  }

    @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<string> {
    return this.usersService.verifyOtp(dto);
  }

    @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginDto);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.userRole,
      },
    };
  }

    @Get('search')
    async searchUsersByName(@Query('name') name: string): Promise<User[]> {
    return this.usersService.findByName(name);
    }

}
