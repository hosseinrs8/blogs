import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Logger,
  LoggerService,
  Param,
  Post,
} from '@nestjs/common';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { PermissionService } from './permission.service';
import { Authorities } from './dto/authorities.dto';

@Controller('permission')
export class PermissionController {
  private readonly logger: LoggerService;

  constructor(private readonly service: PermissionService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Post()
  async assign(
    @Body() dto: AssignPermissionDto,
    // @AuthUserDecorator() userId: string,
  ) {
    this.logger.debug('assign permission', { dto });
    // await this.checkAccess(userId, Authorities.update);
    return this.service.assign(dto);
  }

  @Delete(':userId')
  async revoke(
    @Param('userId') userId: string,
    // @AuthUserDecorator() requesterId: string,
  ) {
    this.logger.debug('revoke permission', { userId });
    // await this.checkAccess(requesterId, Authorities.update);
    return this.service.revoke(userId);
  }

  private async checkAccess(
    userId: string,
    action: Authorities,
  ): Promise<void> {
    this.logger.debug('check user access', { userId, action });
    const can = await this.service.can(userId, action);
    if (!can) {
      this.logger.warn('forbidden attempt', { userId, action });
      throw new ForbiddenException(`${Authorities[action]}`);
    }
  }
}
