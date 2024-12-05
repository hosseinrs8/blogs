import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { ConfigService } from '../tools/config/config.service';
import { PostgresFactory } from '../tools/postgres/pg.factory';
import { BlogPgRepository } from './repositories/blog.pg.repository';
import { ImageService } from '../tools/image/image.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogPgRepository,
    ConfigService,
    PostgresFactory,
    ImageService,
  ],
  imports: [PermissionModule],
})
export class BlogsModule {}
