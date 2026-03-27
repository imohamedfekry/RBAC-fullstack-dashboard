import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../Global/security/guards/permissions.guard';
import { Permission } from '../utils/permission';

export const PERMISSIONS_KEY = 'permissions';
export const OWNER_ONLY_KEY = 'owner_only';
export interface PermissionOptions {
  permissions?: Permission | Permission[];
  ownerOnly?: boolean;
}
export const Permissions = (options: PermissionOptions) =>
  applyDecorators(
    UseGuards(PermissionsGuard),
    SetMetadata(PERMISSIONS_KEY, options.permissions || []),
    SetMetadata(OWNER_ONLY_KEY, options.ownerOnly || false),
  );
