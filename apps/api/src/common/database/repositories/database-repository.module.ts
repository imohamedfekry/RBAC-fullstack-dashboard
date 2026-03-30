import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from './User/User.repository';
import { RoleRepository } from './Role/Role.repository';
import { userRoleReposotory } from './User/UserRole.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, RoleRepository,userRoleReposotory],
  exports: [PrismaService, UserRepository, RoleRepository,userRoleReposotory],
})
export class DatabaseRepositoryModule {}
