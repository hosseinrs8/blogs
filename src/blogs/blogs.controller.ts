import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  LoggerService,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogEntity } from './entities/blog.entity';
import { AuthGuard } from '../auth/decorators/auth.guard';
import { AuthUserDecorator } from '../auth/decorators/auth-user.decorator';

@Controller('blogs')
export class BlogsController {
  private logger: LoggerService;

  constructor(private readonly service: BlogsService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Get('posts')
  @UseGuards(AuthGuard)
  getAll(
    @Query('page') page = 0,
    @AuthUserDecorator() userId: string,
  ): Promise<Array<BlogEntity>> {
    this.logger.debug('get all blog posts', { page, userId });
    return this.service.getAll(page, userId);
  }

  @Get('posts/:id')
  @UseGuards(AuthGuard)
  getOne(
    @Param('id') id: string,
    @AuthUserDecorator() userId: string,
  ): Promise<BlogEntity> {
    this.logger.debug('get one blog post', { id, userId });
    return this.service.getOne(id, userId);
  }

  @Post('posts')
  @UseGuards(AuthGuard)
  create(
    @Body() dto: CreateBlogDto,
    @AuthUserDecorator() userId: string,
  ): Promise<BlogEntity> {
    this.logger.debug('create blog post', { dto });
    return this.service.create(dto, userId);
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string): Promise<boolean> {
    this.logger.debug('remove blog post', { id });
    return this.service.remove(id);
  }
}
