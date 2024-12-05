import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { Authorities } from '../permission/dto/authorities.dto';
import { PermissionService } from '../permission/permission.service';

@Controller('blogs')
export class BlogsController {
  private logger: LoggerService;

  constructor(
    private readonly service: BlogsService,
    private readonly permissionService: PermissionService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  @Get('posts')
  @UseGuards(AuthGuard)
  async getAll(
    @Query('page') page = 0,
    @AuthUserDecorator() userId: string,
  ): Promise<Array<BlogEntity>> {
    this.logger.debug('get all blog posts', { page, userId });
    await this.checkAccess(userId, Authorities.read);
    return this.service.getAll(page, userId);
  }

  @Get('posts/:id')
  @UseGuards(AuthGuard)
  async getOne(
    @Param('id') id: string,
    @AuthUserDecorator() userId: string,
  ): Promise<BlogEntity> {
    this.logger.debug('get one blog post', { id, userId });
    await this.checkAccess(userId, Authorities.read);
    return this.service.getOne(id, userId);
  }

  @Post('posts')
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateBlogDto,
    @AuthUserDecorator() userId: string,
  ): Promise<BlogEntity> {
    this.logger.debug('create blog post', { dto, userId });
    await this.checkAccess(userId, Authorities.create);
    return this.service.create(dto, userId);
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @AuthUserDecorator() userId: string,
  ): Promise<boolean> {
    this.logger.debug('remove blog post', { id });
    await this.checkAccess(userId, Authorities.delete);
    return this.service.remove(id);
  }

  private async checkAccess(
    userId: string,
    action: Authorities,
  ): Promise<void> {
    this.logger.debug('check user access', { userId, action });
    const can = await this.permissionService.can(userId, action);
    if (!can) {
      this.logger.warn('forbidden attempt', { userId, action });
      throw new ForbiddenException(`${Authorities[action]}`);
    }
  }
}
