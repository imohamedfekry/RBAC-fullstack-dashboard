import { Body, Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Auth } from 'src/common/decorators/auth-user.decorator';
import { permissions } from 'src/common/utils/permission';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { crateRoleDto, DeleteRoleDto } from './dto/roles.dto';

@Controller('roles')
@Auth()
export class RolesController {
  constructor(private readonly RolesService: RolesService) {}
  @Get()
  @Permissions({ permissions: permissions.ROLES_READ.key })
  async getRoles() {
    return this.RolesService.getRoles();
  }
  @Post('create')
  @Permissions({ permissions: permissions.ROLES_CREATE.key })
  async createRole(@Body() body: crateRoleDto) {
    return this.RolesService.createRole(body);
  }
  @Delete(':roleId')
  @Permissions({ permissions: permissions.ROLES_DELETE.key })
  async DeleteRole(
    @Param() params: DeleteRoleDto,
    @Request() request: any
  ) {
    return this.RolesService.deleteRole(params,request);
  }
}
