import { IsDefined, IsString } from 'class-validator';

export class UserLoginDto {
  @IsDefined()
  @IsString()
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}
