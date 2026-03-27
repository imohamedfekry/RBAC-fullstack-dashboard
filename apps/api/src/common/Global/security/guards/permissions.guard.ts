import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../database/prisma.service';
import {
  PERMISSIONS_KEY,
} from '../../../decorators/permissions.decorator';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';
import { Permission } from 'src/common/utils/permission';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly roleRepository: RoleRepository,
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
    const userRoles = await this.roleRepository.findUserRoles(user.id);
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
