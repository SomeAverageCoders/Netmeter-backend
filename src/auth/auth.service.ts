import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

    async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

    async login(loginDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    const isValid = user && await bcrypt.compare(loginDto.password, user.password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.userRole };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}