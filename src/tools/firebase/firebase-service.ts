import {
  Injectable,
  Logger,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { ConfigService } from '../config/config.service';
import { FirebaseConfig } from '../config/types';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

@Injectable()
export class FirebaseService {
  private readonly logger: LoggerService;
  public readonly app: FirebaseApp;
  public readonly auth: Auth;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(this.constructor.name);

    this.app = initializeApp(
      this.configService.get<FirebaseConfig>('firebase'),
    );
    this.auth = getAuth(this.app);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(({ user }) => user)
      .catch((error) => {
        this.logger.error('register error', { error });
        throw new UnauthorizedException('FirebaseRegister');
      });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(({ user }) => user)
      .catch((error) => {
        this.logger.error('login error', { error });
        throw new UnauthorizedException('FirebaseLogin');
      });
  }
}
