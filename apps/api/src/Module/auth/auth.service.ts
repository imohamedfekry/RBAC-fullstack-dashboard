import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/common/database/repositories/User/User.repository';
import { RESPONSE_MESSAGES } from 'src/common/utils/response-messages';
import { fail, success } from 'src/common/utils/response.util';
import { loginDto } from './dto/auth.dto';
import { verifyHash } from 'src/common/Global/security';
import { Response } from 'express';
import { JwtHelper } from 'src/common/Global/security/jwt/jwt.helper';
import { nextSnowflakeId } from 'src/common/utils/snowflake';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtHelper: JwtHelper,
  ) { }
  async Login(body: loginDto, res: Response) {
    // find User
    const user = await this.userRepository.findUser(body.user);
    if (!user) {
      return fail(RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    // check password
    const verifyPassword = await verifyHash(body.password, user.password);
    if (!verifyPassword) {
      return fail(RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
    // update user to add jwtsecret
    const updatedUser = await this.userRepository.update(user.id, {
      jwtSecret: nextSnowflakeId().toString()
    })
    // Generate JWT tokens
    const accessToken = this.jwtHelper.generateToken({
      sub: user.id.toString(),
      jwtSecret: updatedUser.jwtSecret,
      type: 'access',
    });
    const refreshToken = this.jwtHelper.generateToken({
      sub: user.id.toString(),
      jwtSecret: updatedUser.jwtSecret,
      type: 'refresh',
    });
    res.cookie('Authorization', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });
    return success(RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS);
  }
}
