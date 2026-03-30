import { Body, Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/common/decorators/auth-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleIdDto, CreateUserDto, UserIdDto } from './dto/user-types.dto';
import { Permission } from 'src/common/utils/permission';
import type { AuthenticatedRequest } from 'src/common/utils/types';

@Controller('user')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @Get('@everyone')
  @Permissions({ permissions: [Permission.USER_READ] })
  async GetUsers() {
    return this.usersService.getusers();
  }
  @Get('@me')
  async GetUser(@Request() request: AuthenticatedRequest) {
    return this.usersService.getProfile(request.user);
  }
  @Post('create')
  @Permissions({ permissions: [Permission.USER_CREATE] })
  async CreateUser(@Body() body: CreateUserDto) {
    return this.usersService.crateUser(body);
  }
  @Post('role/:userId')
  @Permissions({ permissions: [Permission.USER_ROLE_MANAGE] })
  async AddRole(
    @Param() params: UserIdDto,
    @Body() body: RoleIdDto,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.usersService.addRoleToUser(params, body, request);
  }
  @Permissions({ permissions: [Permission.USER_ROLE_MANAGE] })
  @Delete('role/:userId')
  async RemoveRoleFromUser(@Param() params: UserIdDto, @Body() body: RoleIdDto, @Request() request: AuthenticatedRequest) {
    return this.usersService.RemoveRoleFromUser(params, body, request)
  }

}
