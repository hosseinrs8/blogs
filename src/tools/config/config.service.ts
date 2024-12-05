import {
  Injectable,
  Logger,
  LoggerService,
  UnprocessableEntityException,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { AppConfig } from './types';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class ConfigService {
  private readonly logger: LoggerService;
  private readonly config: Record<string, any>;

  constructor() {
    this.logger = new Logger(this.constructor.name);

    const environment = process.env.NODE_ENV || 'default';
    const configFilePath = `./configs/${environment}-config.yaml`;

    try {
      const file = readFileSync(configFilePath, 'utf8');
      this.config = parse(file);
    } catch (error) {
      this.logger.error('error loading configs', { error, configFilePath });
      throw new UnprocessableEntityException(`ConfigFile`);
    }
    ConfigService.validate(this.config);
  }

  private static validate<T = AppConfig>(config: T, logger?: LoggerService) {
    const instance = plainToInstance(AppConfig, config);
    const errors = validateSync(instance);
    if (errors.length > 0) {
      const error = new Error(ConfigService.formatValidationErrors(errors));
      if (logger) logger.error('config validation failed', { error });
      throw error;
    }
  }

  private static formatValidationErrors(errors: any[]): string {
    return errors
      .map(
        (err) =>
          `${err.property}: ${Object.values(err.constraints).join(', ')}`,
      )
      .join('; ');
  }

  get<T>(key: string): T {
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), this.config);
  }
}
