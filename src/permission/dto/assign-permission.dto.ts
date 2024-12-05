import { IsArray, IsDefined, IsNumber, IsString } from 'class-validator';

export class AssignPermissionDto {
  @IsDefined()
  @IsString()
  userId: string;

  @IsDefined()
  @IsArray()
  @IsNumber(undefined, { each: true })
  authorities: Array<number>;
}
