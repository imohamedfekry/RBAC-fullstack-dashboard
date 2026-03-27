import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/common/decorators/auth-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { CreateUserDto } from './dto/user-types.dto';
import { Permission } from 'src/common/utils/permission';

@Controller('user')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('@me')
  async GetUser(@Request() request: any) {
    return this.usersService.getProfile(request.user);
  }
  @Post('create')
  @Permissions({ permissions: Permission.USER_CREATE })  
  async CreateUser(@Body() body: CreateUserDto) {
    return this.usersService.crateUser(body);
  }
}
