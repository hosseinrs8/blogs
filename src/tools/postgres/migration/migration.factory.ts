import { PostgresFactory } from '../pg.factory';
import { Migrator } from './migrator';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MigrationFactory {
  constructor(protected readonly postgresFactory: PostgresFactory) {}

  public async create(
    identityName: string,
    migrationPath = 'migrations',
    migrationTableName = 'migrations',
  ) {
    const client = await this.postgresFactory.createConnection(identityName);
    return new Migrator(
      client,
      migrationPath,
      migrationTableName,
      new Logger(`db.migrator.${identityName}`),
    );
  }
}
