import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { loginDto } from './dto/auth.dto';
import type { AuthenticatedRequest } from 'src/common/utils/types';
import { Auth } from 'src/common/decorators/auth-user.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Post('Login')
  async Login(
    @Body() body: loginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.Login(body, res);
  }
  @Auth()
  @Post('Logout')
  async Logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req, res);
  }
}
