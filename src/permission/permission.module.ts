import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionPgRepository } from './repositories/permission.pg.repository';
import { PostgresFactory } from '../tools/postgres/pg.factory';
import { ConfigService } from '../tools/config/config.service';

@Module({
  controllers: [PermissionController],
  providers: [
    PermissionService,
    PermissionPgRepository,
    PostgresFactory,
    ConfigService,
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
