import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtHelper } from '../jwt/jwt.helper';
import { AuthenticatedRequest, AuthUser } from 'src/common/utils/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtHelper: JwtHelper) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.DEBUG_GUARDS === 'true') {
      console.log('[AuthGuard] canActivate');
    }
    // const type = context.getType();
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token =
      request.cookies['Authorization'] || request.headers['authorization'];

    const user = await this.jwtHelper.VerifyAndGetUser(token);
    if (!user) {
      throw new UnauthorizedException('Forbidden resource');
    }
    request.user = user as AuthUser;
    return true;
  }
}
