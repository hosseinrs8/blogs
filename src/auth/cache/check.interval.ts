import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { SessionPgRepository } from '../repositories/session.pg.repository';
import { AuthenticationCache } from './authentication.cache';

@Injectable()
export class CheckInterval {
  private readonly logger: LoggerService;

  constructor(
    private readonly sessionRepo: SessionPgRepository,
    private readonly cache: AuthenticationCache,
  ) {
    this.logger = new Logger(this.constructor.name);
    setInterval(() => this.run(), 30 * 60 * 1000);
    this.logger.verbose('check interval initialized');
  }

  private async run() {
    this.logger.debug('run check interval');
    const reqs = new Array<Promise<any>>();
    const sessions = await this.sessionRepo.findAll();
    for (const session of sessions) {
      reqs.push(
        this.cache.get(session.token).then((c) => {
          if (!c) this.sessionRepo.revoke(session.id);
        }),
      );
    }
    await Promise.all(reqs);
    this.logger.debug('done check interval');
  }
}
