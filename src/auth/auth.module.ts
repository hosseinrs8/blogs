import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserPgRepository } from './repositories/user.pg.repository';
import { FirebaseService } from '../tools/firebase/firebase-service';
import { ConfigService } from '../tools/config/config.service';
import { PostgresFactory } from '../tools/postgres/pg.factory';
import { SessionPgRepository } from './repositories/session.pg.repository';
import { AuthenticationCache } from './cache/authentication.cache';
import { RedisFactory } from '../tools/redis/redis.factory';
import { CheckInterval } from './cache/check.interval';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserPgRepository,
    FirebaseService,
    ConfigService,
    PostgresFactory,
    SessionPgRepository,
    AuthenticationCache,
    RedisFactory,
    CheckInterval,
  ],
})
export class AuthModule {}
