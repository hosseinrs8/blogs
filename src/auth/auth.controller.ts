import {
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { AuthTokenDecorator } from './decorators/auth-token.decorator';
import { AuthGuard } from './decorators/auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger;

  constructor(private readonly service: AuthService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Post('register')
  register(@Body() dto: UserRegisterDto): Promise<LoginResponseDto> {
    this.logger.debug('register user', { dto });
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: UserLoginDto): Promise<LoginResponseDto> {
    this.logger.debug('login user', { dto });
    return this.service.login(dto);
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  logout(@AuthTokenDecorator() token: string): Promise<boolean> {
    this.logger.debug('logout user', { token });
    return this.service.logout(token);
  }
}
