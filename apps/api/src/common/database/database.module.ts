import { Global, Module } from '@nestjs/common';
import { UserRepository } from './repositories/User/User.repository';
import { PrismaService } from './prisma.service';
import { DatabaseRepositoryModule } from './repositories/database-repository.module';
@Global()
@Module({
  imports: [DatabaseRepositoryModule],
  providers: [PrismaService, UserRepository],
  exports: [PrismaService, UserRepository, DatabaseRepositoryModule],
})
export class DatabaseModule {}
