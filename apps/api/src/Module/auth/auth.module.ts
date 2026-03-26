import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtHelper } from 'src/common/Global/security/jwt/jwt.helper';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtHelper],
  exports: [JwtHelper],
})
export class AuthModule {}
