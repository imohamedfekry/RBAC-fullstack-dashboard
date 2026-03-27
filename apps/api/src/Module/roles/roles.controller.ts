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

@Controller('roles')
@Auth()
export class RolesController {
  constructor(private readonly RolesService: RolesService) {}
  @Get()
  @Permissions({ permissions: Permission.ROLES_READ })
  async getRoles() {
    return this.RolesService.getRoles();
  }
  @Post('create')
  @Permissions({ permissions: Permission.ROLES_CREATE })
  async createRole(@Body() body: crateRoleDto) {
    return this.RolesService.createRole(body);
  }
  @Delete(':roleId')
  @Permissions({ permissions: Permission.ROLES_DELETE })
  async deleteRole(@Param() params: roleIdParamsDto, @Request() request: any) {
    return this.RolesService.deleteRole(params, request);
  }
  @Patch(':roleId')
  @Permissions({ permissions: Permission.ROLES_UPDATE })
  async updateRole(
    @Param() params: roleIdParamsDto,
    @Request() request: any,
    @Body() body: updateRoleDto,
  ) {
 

    return this.RolesService.updateRole(params,request,body);
  }
}
