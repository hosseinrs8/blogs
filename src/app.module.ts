import { Module } from '@nestjs/common';
import { BlogsModule } from './blogs/blogs.module';
import { AuthModule } from './auth/auth.module';
import { MigrationFactory } from './tools/postgres/migration/migration.factory';
import { PostgresFactory } from './tools/postgres/pg.factory';
import { ConfigService } from './tools/config/config.service';
import { AuthenticationCache } from './auth/cache/authentication.cache';
import { RedisFactory } from './tools/redis/redis.factory';

@Module({
  providers: [
    MigrationFactory,
    PostgresFactory,
    ConfigService,
    AuthenticationCache,
    RedisFactory,
  ],
  imports: [AuthModule, BlogsModule],
})
export class AppModule {}
