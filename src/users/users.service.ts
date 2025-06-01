import { Injectable , UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, LoginUserDto } from 'src/dto/user.dto';
import { VerifyOtpDto } from 'src/dto/verify-otp.dto';
import { storeOtp, getOtp, removeOtp } from 'src/helper/otp-store';
import { Twilio } from 'twilio';
import * as bcrypt from 'bcrypt';

const accountSid = 'AC058c0390e34dcec4c54d7072898e53f9';
const authToken = '593a85502b66caae5977219e07f94ff5';
const twilioNumber = '+13163745587';

const client = new Twilio(accountSid, authToken);
@Injectable()
export class UsersService {
      constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

    async createUser(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword, 
      userRole:"user",
      isVerified: false,
    });

    const savedUser = await this.usersRepository.save(user);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storeOtp(dto.mobile, otp);

    console.log(`Sending OTP ${otp} to ${dto.mobile} 📲`);

    await client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: twilioNumber,
    to: user.mobile, 
    });
        return savedUser;
  }

    async verifyOtp(dto: VerifyOtpDto): Promise<string> {
    const validOtp = getOtp(dto.mobile);
    if (validOtp && validOtp === dto.otp) {
      const user = await this.usersRepository.findOneBy({ email: dto.email });
      if (!user) {
        throw new Error('User not found');
      }

      user.isVerified = true;
      await this.usersRepository.save(user);
      removeOtp(dto.mobile);
      return 'Phone number verified successfully';
    } else {
      throw new Error('Invalid OTP');
    }
}

  // Validate user login
  async validateUser(loginDto: LoginUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

async findByEmail(email: string): Promise<User | undefined> {
  const user = await this.usersRepository.findOne({ where: { email } });
  return user ?? undefined; 
}

}

