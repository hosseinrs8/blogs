import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationCache } from '../cache/authentication.cache';
import { RedisFactory } from '../../tools/redis/redis.factory';
import { ConfigService } from '../../tools/config/config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization?.length) {
      throw new UnauthorizedException('NoToken');
    }
    const token = request.headers.authorization.split(' ')[1];
    if (!token || !request.headers.authorization.includes('Bearer')) {
      throw new UnauthorizedException('MalformedToken');
    }
    const cache = new AuthenticationCache(
      new RedisFactory(new ConfigService()),
    );
    await cache.boot();
    const exists = await cache.get(token);
    return !!exists;
  }
}
