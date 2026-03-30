import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: bigint) {
    return await this.prisma.user.findFirst({
      where: { id: id },
      include: { roles: { include: { role: true } } },
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
