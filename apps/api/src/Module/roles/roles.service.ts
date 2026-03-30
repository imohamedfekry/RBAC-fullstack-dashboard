import { Injectable } from '@nestjs/common';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';
import { userRoleReposotory } from 'src/common/database/repositories/User/UserRole.repository';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';
import { fail, success } from 'src/common/utils/response.util';
import type { AuthenticatedRequest } from 'src/common/utils/types';
import {
  crateRoleDto,
  roleIdParamsDto,
  updateRoleDto,
} from './dto/roles.dto';
import { canManageRole } from 'src/common/utils/hierarchy.util';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: userRoleReposotory,
  ) {}

  async getRoles() {
    const roles = await this.roleRepository.find();
    return success(RESPONSE_MESSAGES.ROLE.FETCH_SUCCESS, roles);
  }
  async createRole(body: crateRoleDto, request: AuthenticatedRequest) {
    if (body.hierarchy !== undefined && !canManageRole(request.user, body.hierarchy)) {
      return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail);
    }
    const role = await this.roleRepository.createRole(body);
    return success(RESPONSE_MESSAGES.ROLE.CREATE, role);
  }
  async deleteRole(params: roleIdParamsDto, request: AuthenticatedRequest) {
    const checkroleToDelete = await this.roleRepository.getRoleById(
      BigInt(params.roleId),
    );
    if (!checkroleToDelete) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
    }
    // Check if manager can manage the role
    if (!canManageRole(request.user, checkroleToDelete.hierarchy)) {
      return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail);
    }
    await this.roleRepository.deleteRole(BigInt(params.roleId));
    return success(RESPONSE_MESSAGES.ROLE.DELETE.SUCCESS);
  }
  async updateRole(
    params: roleIdParamsDto,
    request: AuthenticatedRequest,
    body: updateRoleDto,
  ) {
    const exsistRole = await this.roleRepository.getRoleById(
      BigInt(params.roleId),
    );
    if (!exsistRole) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
    }

    // Check if manager can manage the role to be updated
    if (!canManageRole(request.user, exsistRole.hierarchy)) {
      return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail); // reuse generic fail message for hierarchy
    }

    // If updating hierarchy, ensure the new value isn't "better" than manager's own hierarchy
    if (body.hierarchy !== undefined && !canManageRole(request.user, body.hierarchy)) {
      return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail);
    }
    // todo : انواع برمشنز لازم متضافش إلا لو ال current user معاه البرمشن دي
    const dataToUpdate = Object.fromEntries(
      Object.entries({
        ...body,
        permissions: body.permissions
          ? body.permissions.reduce((acc, perm) => acc | perm, 0)
          : undefined,
      }).filter(([_, value]) => value !== undefined),
    );

    const updatedRole = await this.roleRepository.updateRole(BigInt(params.roleId), dataToUpdate);

    return success(RESPONSE_MESSAGES.ROLE.UPDATED, updatedRole);
  }
}
