import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { loginDto } from './dto/auth.dto';
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
}
