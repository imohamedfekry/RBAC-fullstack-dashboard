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
  async deleteRole(roleId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const roleToDelete = await tx.role.findUnique({
        where: { id: roleId },
        select: { hierarchy: true },
      });
      const deletedHierarchy = roleToDelete?.hierarchy!;
      await tx.role.delete({
        where: { id: roleId },
      });
      await tx.role.updateMany({
        where: { hierarchy: { gt: deletedHierarchy } },
        data: {
          hierarchy: {
            decrement: 1,
          },
        },
      });
    });
  }
  async getRoleById(roleId: bigint){
    return await this.prisma.role.findFirst(
      {
        where:{
          id:roleId
        }
      }
    )
  }
}
