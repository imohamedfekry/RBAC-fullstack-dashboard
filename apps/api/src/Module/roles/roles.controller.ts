import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Auth } from 'src/common/decorators/auth-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import {
  crateRoleDto,
  roleIdParamsDto,
  updateRoleDto,
} from './dto/roles.dto';
import { Permission } from 'src/common/utils/permission';
import type { AuthenticatedRequest } from 'src/common/utils/types';

@Controller('roles')
@Auth()
export class RolesController {
  constructor(private readonly RolesService: RolesService) { }
  @Get()
  @Permissions({ permissions: [Permission.ROLES_READ, Permission.ROLES_MANAGE] })
  async getRoles() {
    return this.RolesService.getRoles();
  }
  @Post('create')
  @Permissions({ permissions: [Permission.ROLES_CREATE, Permission.ROLES_MANAGE] })
  async createRole(@Body() body: crateRoleDto, @Request() request: AuthenticatedRequest) {
    return this.RolesService.createRole(body, request);
  }
  @Delete(':roleId')
  @Permissions({ permissions: [Permission.ROLES_DELETE, Permission.ROLES_MANAGE] })
  async deleteRole(@Param() params: roleIdParamsDto, @Request() request: AuthenticatedRequest) {
    return this.RolesService.deleteRole(params, request);
  }
  @Patch(':roleId')
  @Permissions({ permissions: [Permission.ROLES_UPDATE, Permission.ROLES_MANAGE] })
  async updateRole(
    @Param() params: roleIdParamsDto,
    @Request() request: AuthenticatedRequest,
    @Body() body: updateRoleDto,
  ) {


    return this.RolesService.updateRole(params, request, body);
  }
}
