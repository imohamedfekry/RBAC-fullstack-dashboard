import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
} from '../../../decorators/permissions.decorator';
import { Permission } from 'src/common/utils/permission';
import { userRoleReposotory } from 'src/common/database/repositories/User/UserRole.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRoleReposotory : userRoleReposotory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<Permission[]>(
      PERMISSIONS_KEY,
      context.getHandler()
    );
    if (!requiredPermissions?.length) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.isOwner) return true;
    const userRoles = await this.userRoleReposotory.findUserRoles(user.id);
    let userPermissions = 0;
    for (const ur of userRoles) {
      userPermissions |= Number(ur.role.permissions); // اجمع كل الصلاحيات
    }
    const hasAll = requiredPermissions.every(p => (userPermissions & p) === p);
    if (!hasAll) throw new ForbiddenException('Missing Permissions');

    request['user.roles'] = userRoles;
    return true;
  }
}
