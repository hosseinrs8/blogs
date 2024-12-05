import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { RedisFactory } from '../../tools/redis/redis.factory';

@Injectable()
export class AuthenticationCache {
  private readonly logger: LoggerService;
  private redis: RedisClientType<any, any, any>;

  constructor(private readonly redisFactory: RedisFactory) {
    this.logger = new Logger(this.constructor.name);
  }

  async boot() {
    this.logger.debug('boot service');
    this.redis = await this.redisFactory.boot('general');
  }

  async get(
    token: string,
  ): Promise<{ sessionId: string; userId: string } | undefined> {
    const res = await this.redis.get(`auth_${token}`);
    if (res) return JSON.parse(res) as { sessionId: string; userId: string };
    return undefined;
  }

  set(token: string, sessionId: string, userId: string) {
    return this.redis.set(
      `auth_${token}`,
      JSON.stringify({ sessionId, userId }),
      { EX: 3600 },
    );
  }

  drop(token: string) {
    return this.redis.del(`auth_${token}`);
  }
}
