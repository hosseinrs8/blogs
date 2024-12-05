import { PostgresIdentity } from './postgres-identity.interface';
import { ConnectionOptions } from 'tls';
import { PoolConfig, Client as PGClient, Pool as PGPool } from 'pg';
import { Client, Pool } from 'pg';
import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from '../config/config.service';
import { PgConfig } from '../config/types';

export const POSTGRES_IDENTITY_CONFIG_PREFIX = 'postgres-identity-';

@Injectable()
export class PostgresFactory {
  private readonly configCache: Map<string, PoolConfig> = new Map();
  private readonly clientPool: Map<string, PGClient> = new Map();
  private readonly pgPools: Map<string, PGPool> = new Map();
  protected logger: LoggerService;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);
  }

  private loadIdentity(identityName: string): PostgresIdentity {
    this.logger.debug('loadIdentity', { identityName: identityName });
    const rawIdentity = this.configService.get<PgConfig>(
      POSTGRES_IDENTITY_CONFIG_PREFIX + identityName,
    );
    const identity: PostgresIdentity = {
      host: rawIdentity.host,
      port: rawIdentity.port,
      username: rawIdentity.username,
      database: rawIdentity.database,
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
      host: identity.host,
      port: identity.port,
      username: identity.username,
    });
    return identity;
  }

  private static generateConfig(identity: PostgresIdentity): PoolConfig {
    const options: PoolConfig = { host: identity.host, port: identity.port };
    if (identity.username) {
      options.user = identity.username;
    }
    if (identity.password) {
      options.password = identity.password;
    }
    if (identity.database) {
      options.database = identity.database;
    }
    if (identity.tls && identity.tls.enabled) {
      const socketOptions: ConnectionOptions = {};
      if (identity.tls.ca) {
        socketOptions.ca = identity.tls.ca;
      }
      if (identity.tls.key) {
        socketOptions.key = identity.tls.key;
      }
      if (identity.tls.cert) {
        socketOptions.cert = identity.tls.cert;
      }
      socketOptions.rejectUnauthorized = false;
      options.ssl = socketOptions;
    }
    return options;
  }

  private loadConfig(identityName: string): PoolConfig {
    this.logger.debug('loadConfig', { identityName });
    const cachedConfig = this.configCache.get(identityName);
    if (cachedConfig) {
      return cachedConfig;
    } else {
      const options = PostgresFactory.generateConfig(
        this.loadIdentity(identityName),
      );
      this.configCache.set(identityName, options);
      return options;
    }
  }

  create(identityName: string) {
    this.logger.debug('create', { identityName });
    return this.createPool(identityName);
  }

  createPool(identityName: string, force = false): PGPool {
    this.logger.debug(`create new pool`, { identityName });
    const prev = this.pgPools.get(identityName);
    if (prev && !force) return prev;
    const options = this.loadConfig(identityName);
    const pool = new Pool(options);
    this.logger.verbose(`pg-pool successfully created`, { identityName });
    this.pgPools.set(identityName, pool);
    return pool;
  }

  async createConnection(
    identityName: string,
    force = false,
  ): Promise<PGClient> {
    this.logger.debug('createConnection', { identityName: identityName });
    const prev = this.clientPool.get(identityName);
    if (prev && !force) return prev;
    const options = this.loadConfig(identityName);
    const client = new Client(options);
    await client.connect();
    this.logger.verbose(`client successfully created and connected`, {
      identityName,
    });
    this.clientPool.set(identityName, client);
    return client;
  }

  async boot(identityName: string) {
    this.logger.debug('boot service', { identityName: identityName });
    const client = await this.createConnection(identityName);
    this.clientPool.set(identityName, client);
  }

  get(identityName: string) {
    this.logger.debug('get client', { identityName: identityName });
    const client = this.clientPool.get(identityName);
    if (client) {
      return client;
    } else {
      this.logger.error(`identity not booted.`, { identityName });
      throw new Error(`identity "${identityName}" not booted.`);
    }
  }

  closeClientPool() {
    this.logger.debug(`close client pool`);
    return Promise.all([...this.clientPool.values()].map((c) => c.end()));
  }
}
