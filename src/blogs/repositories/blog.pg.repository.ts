import { Injectable } from '@nestjs/common';
import { Pool as PGPool } from 'pg';
import { PostgresFactory } from '../../tools/postgres/pg.factory';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogEntity } from '../entities/blog.entity';

@Injectable()
export class BlogPgRepository {
  private readonly client: PGPool;

  constructor(protected readonly postgresFactory: PostgresFactory) {
    this.client = this.postgresFactory.createPool('general');
  }

  create(
    { title, content, image }: CreateBlogDto,
    userId: string,
    imageId?: string,
  ): Promise<BlogEntity> {
    return this.client
      .query<BlogEntity>(
        `insert into blogs(title, content, image,"imageId", owner) values ($1, $2, $3, $4, $5) returning *;`,
        [title, content, image, imageId, userId],
      )
      .then(({ rows }) => rows[0]);
  }

  findAll(page = 0, userId: string): Promise<Array<BlogEntity>> {
    const limit = 10;
    return this.client
      .query<BlogEntity>(
        `select * from blogs where owner = $1
                        order by "createdAt" desc limit $2 offset $3;`,
        [userId, limit, limit * page],
      )
      .then(({ rows }) => rows);
  }

  findOne(id: string, userId: string): Promise<BlogEntity> {
    return this.client
      .query<BlogEntity>(`select * from blogs where id = $1 and owner = $2;`, [
        id,
        userId,
      ])
      .then(({ rows }) => rows[0]);
  }

  remove(id: string): Promise<boolean> {
    return this.client
      .query<BlogEntity>(`delete from blogs where id = $1 returning *;`, [id])
      .then(({ rowCount }) => rowCount > 0);
  }
}
