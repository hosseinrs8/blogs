import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TlsConfig {
  @IsDefined()
  @IsBoolean()
  enabled: boolean;

  @IsDefined()
  @IsString()
  caPath?: string;

  @IsDefined()
  @IsString()
  certPath?: string;

  @IsDefined()
  @IsString()
  keyPath?: string;
}

export class PgConfig {
  @IsDefined()
  @IsString()
  host: string;

  @IsDefined()
  @IsNumber()
  port: number;

  @IsOptional()
  @IsString()
  passwordPath?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TlsConfig)
  tls?: TlsConfig;
}

export class FirebaseConfig {
  /**
   * An encrypted string used when calling certain APIs that don't need to
   * access private user data
   * (example value: `AIzaSyDOCAbC123dEf456GhI789jKl012-MnO`).
   */
  @IsOptional()
  @IsString()
  apiKey?: string;
  /**
   * Auth domain for the project ID.
   */
  @IsOptional()
  @IsString()
  authDomain?: string;
  /**
   * Default Realtime Database URL.
   */
  @IsOptional()
  @IsString()
  databaseURL?: string;
  /**
   * The unique identifier for the project across all of Firebase and
   * Google Cloud.
   */
  @IsOptional()
  @IsString()
  projectId?: string;
  /**
   * The default Cloud Storage bucket name.
   */
  @IsOptional()
  @IsString()
  storageBucket?: string;
  /**
   * Unique numerical value used to identify each sender that can send
   * Firebase Cloud Messaging messages to client apps.
   */
  @IsOptional()
  @IsString()
  messagingSenderId?: string;
  /**
   * Unique identifier for the app.
   */
  @IsOptional()
  @IsString()
  appId?: string;
  /**
   * An ID automatically created when you enable Analytics in your
   * Firebase project and register a web app. In versions 7.20.0
   * and higher, this parameter is optional.
   */
  @IsOptional()
  @IsString()
  measurementId?: string;
}

export class RedisConfig {
  @IsDefined()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  passwordPath?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  database?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TlsConfig)
  tls?: TlsConfig;
}

export class AppConfig {
  @ValidateNested()
  @Type(() => PgConfig)
  'postgres-identity-general': PgConfig;

  @ValidateNested()
  @Type(() => FirebaseConfig)
  firebase: FirebaseConfig;

  @ValidateNested()
  @Type(() => RedisConfig)
  'redis-identity-general': RedisConfig;
}
