import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class userRoleReposotory {
  constructor(private readonly prisma: PrismaService) {}
  async add(userId: bigint, roleId: bigint) {
    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      create: {
        userId,
        roleId,
      } as Prisma.UserRoleUncheckedCreateInput,
      update: {},
    });
  }
  async remove(userId: bigint, roleId: bigint) {
    return this.prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
  }
  async findUserRoles(userId: bigint) {
    return await this.prisma.userRole.findMany({
      where: { userId: userId },
      include: { role: true }, // مهم جدًا
    });
  }
}
