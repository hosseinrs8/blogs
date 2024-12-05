import { Injectable } from '@nestjs/common';
import { Pool as PGPool } from 'pg';
import { PostgresFactory } from '../../tools/postgres/pg.factory';
import { AssignPermissionDto } from '../dto/assign-permission.dto';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionPgRepository {
  private readonly client: PGPool;

  constructor(protected readonly postgresFactory: PostgresFactory) {
    this.client = this.postgresFactory.createPool('general');
  }

  create({
    userId,
    authorities,
  }: AssignPermissionDto): Promise<PermissionEntity> {
    return this.client
      .query<PermissionEntity>(
        `insert into permissions("userId", authorities) values ($1, $2::integer[]) returning *;`,
        [userId, authorities],
      )
      .then(({ rows }) => rows[0]);
  }

  findOne(userId: string): Promise<PermissionEntity> {
    return this.client
      .query<PermissionEntity>(
        `select * from permissions where "userId" = $1;`,
        [userId],
      )
      .then(({ rows }) => rows[0]);
  }

  remove(userId: string): Promise<boolean> {
    return this.client
      .query<PermissionEntity>(
        `delete from permissions where "userId" = $1 returning *;`,
        [userId],
      )
      .then(({ rowCount }) => rowCount > 0);
  }
}
