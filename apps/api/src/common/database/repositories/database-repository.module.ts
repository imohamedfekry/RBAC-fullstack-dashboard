import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from './User/User.repository';
import { RoleRepository } from './Role/Role.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, RoleRepository],
  exports: [PrismaService, UserRepository, RoleRepository],
})
export class DatabaseRepositoryModule {}
