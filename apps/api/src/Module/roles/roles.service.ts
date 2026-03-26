import { Injectable } from '@nestjs/common';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';
import { success } from 'src/common/utils/response.util';
import { crateRoleDto } from './dto/roles.dto';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoles() {
    const roles = await this.roleRepository.find();
    return success(RESPONSE_MESSAGES.ROLE.FETCH_SUCCESS, roles);
  }
  async createRole(body: crateRoleDto) {
    const role = await this.roleRepository.createRole(body);
    return success(RESPONSE_MESSAGES.ROLE.CREATE, role);
  }
}
