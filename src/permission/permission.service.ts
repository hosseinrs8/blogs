import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { PermissionPgRepository } from './repositories/permission.pg.repository';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { Authorities } from './dto/authorities.dto';

@Injectable()
export class PermissionService {
  private readonly logger: LoggerService;

  constructor(private readonly repo: PermissionPgRepository) {
    this.logger = new Logger(this.constructor.name);
  }

  async assign(dto: AssignPermissionDto) {
    this.logger.debug('assign permission', { dto });
    const prev = await this.repo.findOne(dto.userId);
    if (prev) {
      await this.revoke(dto.userId);
    }
    return this.repo.create(dto);
  }

  revoke(userId: string) {
    this.logger.debug('revoke permission', { userId });
    return this.repo.remove(userId);
  }

  async can(userId: string, action: Authorities): Promise<boolean> {
    const permission = await this.repo.findOne(userId);
    if (permission) {
      return permission.authorities.includes(action);
    }
    return false;
  }
}
