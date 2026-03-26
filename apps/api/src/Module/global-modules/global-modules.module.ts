import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { DefaultModule } from '../default/default.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from 'src/common/Global/config/env.validation';
import appConfig from 'src/common/bootstrap/config/app.config';
import databaseConfig from 'src/common/database/database.config';
import jwtConfig from 'src/common/Global/security/jwt/jwt.config';
import { PermissionsGuard } from 'src/common/Global/security/guards/permissions.guard';
import { JwtHelper } from 'src/common/Global/security/jwt/jwt.helper';
import { DatabaseRepositoryModule } from 'src/common/database/repositories/database-repository.module';
import { JwtHelperModule } from 'src/common/Global/security/jwt/JwtHelper.Module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    JwtHelperModule,
    DatabaseRepositoryModule,
    AuthModule,
    UsersModule,
    RolesModule,
    DefaultModule,
  ],
  providers: [PermissionsGuard],
  exports: [
    AuthModule,
    UsersModule,
    RolesModule,
    DatabaseRepositoryModule,
    PermissionsGuard,
  ],
})
export class GlobalModules {}
