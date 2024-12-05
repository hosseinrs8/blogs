import { Injectable } from '@nestjs/common';
import { Pool as PGPool } from 'pg';
import { PostgresFactory } from '../../tools/postgres/pg.factory';
import { UserEntity } from '../entities/user.entity';
import { UserRegisterDto } from '../dto/user-register.dto';

@Injectable()
export class UserPgRepository {
  private readonly client: PGPool;

  constructor(protected readonly postgresFactory: PostgresFactory) {
    this.client = this.postgresFactory.createPool('general');
  }

  create({ name, password, email }: UserRegisterDto): Promise<UserEntity> {
    return this.client
      .query<UserEntity>(
        `insert into users(name, email, password) values ($1, $2, $3) returning *;`,
        [name, email, password],
      )
      .then(({ rows }) => rows[0]);
  }

  findOne(id: string): Promise<UserEntity> {
    return this.client
      .query<UserEntity>(`select * from users where id = $1;`, [id])
      .then(({ rows }) => rows[0]);
  }

  findByEmail(email: string): Promise<UserEntity> {
    return this.client
      .query<UserEntity>(`select * from users where email = $1;`, [email])
      .then(({ rows }) => rows[0]);
  }
}
