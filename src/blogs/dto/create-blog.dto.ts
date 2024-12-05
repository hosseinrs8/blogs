import { IsDefined, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageId?: string;
}
