import { Injectable } from '@nestjs/common';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';
import { fail, success } from 'src/common/utils/response.util';
import {
  crateRoleDto,
  roleIdParamsDto,
  updateRoleDto,
} from './dto/roles.dto';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) { }

  async getRoles() {
    const roles = await this.roleRepository.find();
    return success(RESPONSE_MESSAGES.ROLE.FETCH_SUCCESS, roles);
  }
  async createRole(body: crateRoleDto) {
    const role = await this.roleRepository.createRole(body);
    return success(RESPONSE_MESSAGES.ROLE.CREATE, role);
  }
  async deleteRole(params: roleIdParamsDto, request) {
    const checkroleToDelete = await this.roleRepository.getRoleById(
      BigInt(params.roleId),
    );
    if (!checkroleToDelete) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
    }
    // if owner skip ..
    if (!request.user.isOwner) {
      if (request.user.roles.length === 0) {
        return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail);
      }
      const minUserHierarchy = Math.min(
        ...request.user.roles.map((r) => r.hierarchy),
      );
      const targetRoleHierarchy = checkroleToDelete.hierarchy ?? Infinity;
      const canManage = minUserHierarchy < targetRoleHierarchy;
      if (!canManage) {
        return fail(RESPONSE_MESSAGES.ROLE.DELETE.fail);
      }
    }
    await this.roleRepository.deleteRole(BigInt(params.roleId));
    return success(RESPONSE_MESSAGES.ROLE.DELETE.SUCCESS);
  }
  async updateRole(
    params: roleIdParamsDto,
    request: any,
    body: updateRoleDto,
  ) {
    const exsistRole = await this.roleRepository.getRoleById(
      BigInt(params.roleId),
    );
    if (!exsistRole) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
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
