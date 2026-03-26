import { PrismaClient } from '@prisma/client/index';
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extendPrisma } from './prisma.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const connectionString =
      config.get<string>('database.url') ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    });
    const extended = extendPrisma(this);
    Object.assign(this, extended);
  }

  async onModuleInit() {
    console.log('Connecting to the database...');
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    console.log('Disconnecting from the database...');
    await this.$disconnect();
    console.log('✅ Database disconnected successfully');
  }
}
