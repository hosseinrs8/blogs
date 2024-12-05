import { IsDefined, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}
