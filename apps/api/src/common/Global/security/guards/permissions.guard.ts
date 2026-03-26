import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../database/prisma.service';
import {
  OWNER_ONLY_KEY,
  PERMISSIONS_KEY,
} from '../../../decorators/permissions.decorator';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.DEBUG_GUARDS === 'true') {
      console.log('[PermissionsGuard] canActivate');
    }
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    const ownerOnly = this.reflector.get<boolean>(
      OWNER_ONLY_KEY,
      context.getHandler(),
    );
    if (!requiredPermissions?.length) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.id) throw new ForbiddenException('Forbidden resource');
    if (user.isOwner === true) return true;
    if (ownerOnly) {
      throw new ForbiddenException('Insufficient permissions');
    }
    // Fetch permissions from DB; do not assume request.user has relations loaded.
    const userRoles = await this.roleRepository.findUserRoles(user.id);

    if (userRoles.length < 1) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        const key = rp.permission?.key;
        if (key) userPermissions.add(key);
      }
    }
    if (!userPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const hasAll = requiredPermissions.every((p) => userPermissions.has(p));

    if (!hasAll) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
