import 'reflect-metadata';

import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { OwnerSeedCredentialsDto } from './owner-seed.dto';
import {
  readPasswordSimple,
  readPasswordWithStrengthMeter,
} from './terminal-password';
import { hashHandler } from '../../src/common/Global/security/hash.helper';
import { nextSnowflakeId } from '../../src/common/utils/snowflake';
import readline from 'node:readline';

loadEnv({ path: path.resolve(__dirname, '..', '.env') });

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required for seeding');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const prisma = createPrismaClient();

function askLine(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  const out: string[] = [];
  for (const e of errors) {
    if (e.constraints) out.push(...Object.values(e.constraints));
    if (e.children?.length) out.push(...flattenValidationErrors(e.children));
  }
  return out;
}

async function hasOwner(): Promise<boolean> {
  return (await prisma.user.findFirst({ where: { isOwner: true } })) !== null;
}

async function seedOwner(dto: OwnerSeedCredentialsDto) {
  const hashedPassword = await hashHandler(dto.password);
  return prisma.user.upsert({
    where: { user: dto.username },
    update: { password: hashedPassword, isOwner: true },
    create: {
      id: nextSnowflakeId(),
      user: dto.username,
      password: hashedPassword,
      isOwner: true,
    },
  });
}

async function main() {
  await prisma.$connect();

  if (await hasOwner()) {
    console.log('⚠️  An owner already exists (isOwner=true). Seed skipped.');
    return;
  }

  console.log('No owner found. Create the application owner:\n');

  const username = (await askLine('Owner username: ')).trim();

  let dto: OwnerSeedCredentialsDto | null = null;

  for (;;) {
    const password = await readPasswordWithStrengthMeter('Owner password: ');
    const confirm = await readPasswordSimple('Confirm password: ');

    if (password !== confirm) {
      console.log('\n❌  Passwords do not match. Try again.\n');
      continue;
    }

    const candidate = plainToInstance(OwnerSeedCredentialsDto, {
      username,
      password,
    });
    const errors = await validate(candidate);
    if (errors.length === 0) {
      dto = candidate;
      break;
    }

    console.log('\n❌  Password does not meet requirements:');
    for (const msg of flattenValidationErrors(errors)) {
      console.log(`   • ${msg}`);
    }
    console.log('\nEnter a stronger password (strength meter updates as you type).\n');
  }

  const created = await seedOwner(dto!);
  console.log('\n✅  Owner created:', {
    user: created.user,
    note: 'isOwner=true; roles and permissions are empty until you add them.',
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
