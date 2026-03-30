import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RoleIdDto, CreateUserDto, UserIdDto, UserProfileDto } from './dto/user-types.dto';
import { UserRepository } from 'src/common/database/repositories/User/User.repository';
import { userRoleReposotory } from 'src/common/database/repositories/User/UserRole.repository';
import { fail, success } from 'src/common/utils/response.util';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';
import { RoleRepository } from 'src/common/database/repositories/Role/Role.repository';
import { AuthUser, AuthenticatedRequest } from 'src/common/utils/types';
import { canManageRole, canManageUser } from 'src/common/utils/hierarchy.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly UserRepository: UserRepository,
    private readonly userRoleRepository: userRoleReposotory,
    private readonly roleRepository: RoleRepository,
  ) { }
  async getProfile(user: AuthUser) {
    const raw = {
      id: user?.id?.toString?.() ?? String(user?.id ?? ''),
      user: user?.user,
      isOwner: Boolean(user?.isOwner),
      roles: Array.isArray(user?.roles) ? user.roles : [],
    };

    // excludeExtraneousValues => احترام @Expose() داخل الـ DTO

    return success(
      RESPONSE_MESSAGES.USER.PROFILE.FETCH_SUCCESS,
      plainToInstance(UserProfileDto, raw, {
        excludeExtraneousValues: true,
      }),
    );
  }
  async crateUser(body: CreateUserDto) {
    // check if user is exsist
    const exsistUser = await this.UserRepository.findUser(body.user);
    if (exsistUser) {
      return fail(RESPONSE_MESSAGES.USER.CREATE.FAIL.USER_ALREADY_EXISTS);
    }
    // create user
    await this.UserRepository.create({
      user: body.user,
      password: body.password,
    });

    return success(RESPONSE_MESSAGES.USER.CREATE.SUCCESS);
  }

  async addRoleToUser(params: UserIdDto, body: RoleIdDto, request: AuthenticatedRequest) {
    const exsistUser = await this.UserRepository.findById(BigInt(params.userId));
    if (!exsistUser) {
      return fail(RESPONSE_MESSAGES.USER.NOTFOUND);
    }
    const exsistRole = await this.roleRepository.getRoleById(BigInt(body.roleId));
    if (!exsistRole) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
    }
    if (exsistUser.isOwner) {
      if (!canManageUser(request.user, exsistUser) || !canManageRole(request.user, exsistRole.hierarchy)) {
        return fail(RESPONSE_MESSAGES.USER.ADD_ROLE.FAIL);
      }
    }
    await this.userRoleRepository.add(BigInt(params.userId), BigInt(body.roleId));
    return success(RESPONSE_MESSAGES.USER.ADD_ROLE.SUCCESS);
  }

  async RemoveRoleFromUser(params: UserIdDto, body: RoleIdDto, request: AuthenticatedRequest) {
    const exsistUser = await this.UserRepository.findById(BigInt(params.userId));
    if (!exsistUser) {
      return fail(RESPONSE_MESSAGES.USER.NOTFOUND);
    }
    if (exsistUser.isOwner) {
      return fail(RESPONSE_MESSAGES.USER.REMOVE_ROLE.FAIL);
    }
    const exsistRole = await this.roleRepository.getRoleById(BigInt(body.roleId));
    if (!exsistRole) {
      return fail(RESPONSE_MESSAGES.ROLE.NOTFOUND);
    }
    if (!request.user.isOwner) {
      if (!canManageUser(request.user, exsistUser) || !canManageRole(request.user, exsistRole.hierarchy)) {
        return fail(RESPONSE_MESSAGES.USER.REMOVE_ROLE.FAIL);
      }
    }
    await this.userRoleRepository.remove(BigInt(params.userId), BigInt(body.roleId));
    return success(RESPONSE_MESSAGES.USER.REMOVE_ROLE.SUCCESS);
  }

}
