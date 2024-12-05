import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RedisFactory } from '../../tools/redis/redis.factory';
import { ConfigService } from '../../tools/config/config.service';
import { AuthenticationCache } from '../cache/authentication.cache';

export const AuthUserDecorator = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    const cache = new AuthenticationCache(
      new RedisFactory(new ConfigService()),
    );
    await cache.boot();
    const { userId } = await cache.get(token);
    return userId;
  },
);
