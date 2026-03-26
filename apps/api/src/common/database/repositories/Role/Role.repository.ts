import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private prisma: PrismaService) {}
  async find() {
    return await this.prisma.role.findMany();
  }
  async findUserRoles(userId: bigint) {
    return await this.prisma.userRole.findMany({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }
  async createRole(
    data: Omit<Prisma.RoleUncheckedCreateInput, 'id' | 'hierarchy'>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const maxHierarchy = await tx.role.aggregate({
        _max: { hierarchy: true },
      });
      const newHierarchy = (maxHierarchy._max.hierarchy ?? 0) + 1;
      return await tx.role.create({
        data: {
          ...data,
          hierarchy: newHierarchy,
        } as Prisma.RoleUncheckedCreateInput,
      });
    });
  }
}
