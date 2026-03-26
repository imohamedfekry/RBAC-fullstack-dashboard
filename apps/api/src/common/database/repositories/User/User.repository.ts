import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: bigint) {
    return await this.prisma.user.findFirst({
      where: { id: id }, // Prisma v5/v6 يستخدم number
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }
  async findUser(user: string) {
    return await this.prisma.user.findUnique({
      where: { user },
    });
  }
  async create(
    data: Omit<Prisma.UserUncheckedCreateInput, 'id'>,
    select?: Prisma.UserSelect,
  ) {
    const user = await this.prisma.user.create({
      data: data as Prisma.UserUncheckedCreateInput,
      ...(select && { select }),
    });
    return user;
  }
}
