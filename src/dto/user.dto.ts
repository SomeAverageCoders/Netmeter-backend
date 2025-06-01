export class CreateUserDto {
  name: string;
  email: string;
  mobile: string;
  userRole: string;
  password: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
