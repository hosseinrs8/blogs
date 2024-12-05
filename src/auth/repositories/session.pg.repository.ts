import { Injectable } from '@nestjs/common';
import { Pool as PGPool } from 'pg';
import { PostgresFactory } from '../../tools/postgres/pg.factory';
import { SessionEntity } from '../entities/session.entity';

@Injectable()
export class SessionPgRepository {
  private readonly client: PGPool;

  constructor(protected readonly postgresFactory: PostgresFactory) {
    this.client = this.postgresFactory.createPool('general');
  }

  create({
    userId,
    token,
  }: Omit<SessionEntity, 'id' | 'revokedAt'>): Promise<SessionEntity> {
    return this.client
      .query<SessionEntity>(
        `insert into sessions(token, "userId") values ($1, $2) returning *;`,
        [token, userId],
      )
      .then(({ rows }) => rows[0]);
  }

  findOne(id: string): Promise<SessionEntity> {
    return this.client
      .query<SessionEntity>(
        `select * from sessions where id = $1 and "revokedAt" is null;`,
        [id],
      )
      .then(({ rows }) => rows[0]);
  }

  findByToken(token: string): Promise<SessionEntity> {
    return this.client
      .query<SessionEntity>(
        `select * from sessions where token = $1 and "revokedAt" is null;`,
        [token],
      )
      .then(({ rows }) => rows[0]);
  }

  revoke(id: string): Promise<boolean> {
    return this.client
      .query<SessionEntity>(
        `update sessions set "revokedAt" = now() where id = $1 returning *;`,
        [id],
      )
      .then(({ rowCount }) => rowCount > 0);
  }

  findAll() {
    return this.client
      .query<SessionEntity>(`select * from sessions where "revokedAt" is null`)
      .then((r) => r.rows);
  }
}
