import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  OWNER_ONLY_KEY,
} from '../../../decorators/permissions.decorator';
import { Permission } from 'src/common/utils/permission';
import { userRoleReposotory } from 'src/common/database/repositories/User/UserRole.repository';
import { AuthenticatedRequest } from 'src/common/utils/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRoleReposotory: userRoleReposotory
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const requiredPermissions = this.reflector.get<Permission[]>(PERMISSIONS_KEY, handler);
    const ownerOnly = this.reflector.get<boolean>(OWNER_ONLY_KEY, handler);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // 1. Check Owner-Only first
    if (ownerOnly && !user.isOwner) {
      throw new ForbiddenException('Missing Permissions');
    }

    // 2. Bypass for owners on other permissions
    if (user.isOwner) return true;

    // 3. No permissions required
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const userRoles = await this.userRoleReposotory.findUserRoles(user.id);
    let userPermissions = 0;
    for (const ur of userRoles) {
      userPermissions |= Number(ur.role.permissions);
    }
    console.log(userPermissions);

    const hasOne = requiredPermissions.some(p => (userPermissions & p) === p);
    if (!hasOne) throw new ForbiddenException('Missing Permissions');
    request['user.roles'] = userRoles;
    return true;
  }
}
