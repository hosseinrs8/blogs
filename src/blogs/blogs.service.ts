import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogPgRepository } from './repositories/blog.pg.repository';
import { BlogEntity } from './entities/blog.entity';
import { ImageService } from '../tools/image/image.service';
import { randomUUID } from 'crypto';

@Injectable()
export class BlogsService {
  private readonly logger: LoggerService;

  constructor(
    private readonly repository: BlogPgRepository,
    private readonly imageService: ImageService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async create(dto: CreateBlogDto, userId: string): Promise<BlogEntity> {
    this.logger.debug('create blog post', { dto });
    let imageId: string | undefined;
    if (dto.image) {
      try {
        imageId = randomUUID();
        await this.imageService.save(dto.image, imageId);
      } catch (e) {
        this.logger.error('failed to store image', { error: e });
      }
    }
    return this.repository.create(dto, userId, imageId);
  }

  getAll(page = 0, userId: string): Promise<Array<BlogEntity>> {
    this.logger.debug('get all blog posts', { page, userId });
    return this.repository.findAll(page, userId);
  }

  getOne(id: string, userId: string): Promise<BlogEntity> {
    this.logger.debug('get one blog post');
    return this.repository.findOne(id, userId);
  }

  remove(id: string): Promise<boolean> {
    this.logger.debug('remove blog post', { id });
    return this.repository.remove(id);
  }
}
