import {
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

export interface OwnableEntity {
  id: string;
  createdBy: string;
}

export abstract class BaseOwnershipGuard<T extends OwnableEntity> implements CanActivate {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityName: string,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const entityId = request.params.id;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!entityId) {
      throw new BadRequestException(`${this.entityName} ID is required`);
    }

    const entityRecord = await this.repository.findOne({ where: { id: entityId } as any });

    if (!entityRecord) {
      throw new BadRequestException(`${this.entityName} with ID ${entityId} not found`);
    }

    if (entityRecord.createdBy !== user.id) {
      throw new ForbiddenException(
        `You are not authorized to perform this action on this ${this.entityName.toLowerCase()}`,
      );
    }

    request[this.entityName.toLowerCase()] = entityRecord;

    return true;
  }
}
