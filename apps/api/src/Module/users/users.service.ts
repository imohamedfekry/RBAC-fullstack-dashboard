import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto, UserProfileDto } from './dto/user-types.dto';
import { UserRepository } from 'src/common/database/repositories/User/User.repository';
import { fail, success } from 'src/common/utils/response.util';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';

@Injectable()
export class UsersService {
  constructor(private readonly UserRepository: UserRepository) {}
  async getProfile(user: any) {
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
}
