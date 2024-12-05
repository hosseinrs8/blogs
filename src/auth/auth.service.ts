import {
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { FirebaseService } from '../tools/firebase/firebase-service';
import { UserPgRepository } from './repositories/user.pg.repository';
import { UserLoginDto } from './dto/user-login.dto';
import { SessionPgRepository } from './repositories/session.pg.repository';
import { AuthenticationCache } from './cache/authentication.cache';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    private readonly firebase: FirebaseService,
    private readonly repository: UserPgRepository,
    private readonly sessionRepo: SessionPgRepository,
    private readonly cache: AuthenticationCache,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async register(dto: UserRegisterDto): Promise<LoginResponseDto> {
    this.logger.debug('register user', { dto });
    await this.repository.create(dto);
    await this.firebase.register(dto.email, dto.password);
    return this.login(dto);
  }

  async login({ email, password }: UserLoginDto): Promise<LoginResponseDto> {
    this.logger.debug('login user', { email, password });
    const user = await this.repository.findByEmail(email);
    if (!user) {
      this.logger.warn('user not found', { email });
      throw new NotFoundException('user');
    }
    const credentials = await this.firebase.login(email, password);
    const token = await credentials.getIdToken();
    const session = await this.sessionRepo.create({ token, userId: user.id });
    await this.cache.set(token, session.id, user.id);
    return { ...user, token };
  }

  async logout(token: string): Promise<boolean> {
    const session = await this.sessionRepo.findOne(token);
    this.logger.debug('logout user', { id: session.userId });
    if (!session) {
      this.logger.warn('session not found', { token });
      throw new NotFoundException();
    }
    await this.cache.drop(token);
    return this.sessionRepo.revoke(session.id);
  }
}
