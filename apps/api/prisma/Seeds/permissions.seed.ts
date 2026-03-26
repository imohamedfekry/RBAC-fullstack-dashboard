import { PrismaService } from 'src/common/database/prisma.service';
import { Prisma } from '@prisma/client';
import { nextSnowflakeId } from 'src/common/utils/snowflake';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { permissions } from 'src/common/utils/permission';
import { Logger } from '@nestjs/common';

export async function seedPermissions(prisma: PrismaService) {
    const logger = new Logger('SeedPermissions');

  const allPermissions = Object.values(permissions);
  for (const perm of allPermissions) {
  await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        description: perm.description,
      },
      create: {
        id: nextSnowflakeId(),
        key: perm.key,
        description: perm.description,
      },
    });    
  }
  logger.log('Permissions synced to DB');
}
