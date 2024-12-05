import {
  createClient,
  RedisClientOptions,
  RedisClientType as RedisClient,
} from '@redis/client';
import { RedisIdentity, RedisIdentityRaw } from './redis-identity.interface';
import { RedisSocketOptions } from '@redis/client/dist/lib/client/socket';
import {
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from '@redis/client/dist/lib/commands';
import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { readFileSync } from 'fs';

export const REDIS_IDENTITY_CONFIG_PREFIX = 'redis-identity-';

export type RedisClientType = RedisClient<
  RedisModules,
  RedisFunctions,
  RedisScripts
>;

@Injectable()
export class RedisFactory {
  private readonly configCache: Map<string, RedisClientOptions> = new Map();
  private readonly clientPool: Map<string, RedisClientType> = new Map();
  protected logger: LoggerService;

  constructor(protected readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);
  }

  private loadIdentity(identityName: string): RedisIdentity {
    this.logger.debug('loadIdentity', { identityName: identityName });
    const rawIdentity = this.configService.get<RedisIdentityRaw>(
      REDIS_IDENTITY_CONFIG_PREFIX + identityName,
    );
    const identity: RedisIdentity = {
      url: rawIdentity.url,
      username: rawIdentity.username,
    };
    if (rawIdentity.passwordPath) {
      this.logger.debug(`calling readFileSync`, {
        passwordPath: '***',
      });
      identity.password = readFileSync(rawIdentity.passwordPath, 'utf-8');
    }
    if (rawIdentity.tls && rawIdentity.tls.enabled) {
      identity.tls = {
        enabled: rawIdentity.tls.enabled,
      };
      if (rawIdentity.tls.keyPath) {
        this.logger.debug(`calling readFileSync`, {
          keyPath: '***',
        });
        identity.tls.key = readFileSync(rawIdentity.tls.keyPath, 'utf-8');
      }
      if (rawIdentity.tls.caPath) {
        this.logger.debug(`calling readFileSync`, {
          caPath: '***',
        });
        identity.tls.ca = readFileSync(rawIdentity.tls.caPath, 'utf-8');
      }
      if (rawIdentity.tls.certPath) {
        this.logger.debug(`calling readFileSync`, {
          certPath: '***',
        });
        identity.tls.cert = readFileSync(rawIdentity.tls.certPath, 'utf-8');
      }
    }
    this.logger.verbose(`identity successfully loaded`, {
      url: identity.url,
      username: identity.username,
    });
    return identity;
  }

  private static generateConfig(identity: RedisIdentity): RedisClientOptions {
    const options: RedisClientOptions = { url: identity.url };
    if (identity.username) {
      options.username = identity.username;
    }
    if (identity.password) {
      options.password = identity.password;
    }
    if (identity.database) {
      options.database = identity.database;
    }
    if (identity.tls && identity.tls.enabled) {
      const socketOptions: RedisSocketOptions = {
        tls: true,
      };
      if (identity.tls.ca) {
        socketOptions.ca = identity.tls.ca;
      }
      if (identity.tls.key) {
        socketOptions.key = identity.tls.key;
      }
      if (identity.tls.cert) {
        socketOptions.cert = identity.tls.cert;
      }
      options.socket = socketOptions;
    }
    return options;
  }

  protected loadConfig(identityName: string): RedisClientOptions {
    this.logger.debug('loadConfig', { identityName: identityName });
    const cachedConfig = this.configCache.get(identityName);
    if (cachedConfig) {
      return cachedConfig;
    } else {
      const options = RedisFactory.generateConfig(
        this.loadIdentity(identityName),
      );
      this.configCache.set(identityName, options);
      return options;
    }
  }

  async create(identityName: string, advanceOptions?: RedisClientOptions) {
    this.logger.debug('create', {
      identityName: identityName,
      advancedOption: advanceOptions,
    });
    const options = this.loadConfig(identityName);
    const client = createClient({ ...options, ...advanceOptions });
    await client
      .on('error', (e) => this.logger.error('redis error', { error: e }))
      .on('connect', () => this.logger.verbose('redis client connected'))
      .connect();
    this.logger.verbose(`client successfully created and connected`, {
      identityName: identityName,
    });
    return client;
  }

  async boot(identityName: string) {
    this.logger.debug('boot', { identityName: identityName });
    if (!this.clientPool.has(identityName)) {
      const client = await this.create(identityName);
      this.clientPool.set(identityName, client);
      return client;
    }
    return this.clientPool.get(identityName);
  }

  get(identityName: string) {
    this.logger.debug('get client by identityName', {
      identityName: identityName,
    });
    const client = this.clientPool.get(identityName);
    if (client) {
      return client;
    } else {
      this.logger.error(`identity not booted.`, { identityName: identityName });
      throw new Error(`identity "${identityName}" not booted.`);
    }
  }

  closeClientPool() {
    this.logger.debug(`close client pool`);
    return Promise.all([...this.clientPool.values()].map((c) => c.quit()));
  }
}
