import { PrismaClient } from '@prisma/client/index';
import { snowflake } from '../utils/snowflake';
import { encrypt, hashHandler } from '../Global/security';
export function extendPrisma(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const result = await query(args);
          return convert(result);
        },
        // Trigger on CREATE and UPDATE
        async create({ model, args, query }) {
          stripUserIsOwnerFromMutationArgs(model, args);
          await handleIdsnowflake(model, args);
          await handlePasswordHash(model, args);
          return query(args);
        },
        async update({ model, args, query }) {
          stripUserIsOwnerFromMutationArgs(model, args);
          await handlePasswordHash(model, args);
          return query(args);
        },
        async upsert({ model, args, query }) {
          stripUserIsOwnerFromMutationArgs(model, args);
          await handleIdsnowflake(model, args); // Need to generate ID for upsert.create
          return query(args);
        },
        async createMany({ model, args, query }) {
          stripUserIsOwnerFromMutationArgs(model, args);
          await handleIdsnowflake(model, args); // Need to generate IDs for createMany
          return query(args);
        },
        async updateMany({ model, args, query }) {
          stripUserIsOwnerFromMutationArgs(model, args);
          return query(args);
        },
      },
    },
  });
}
/** Clients must never set `isOwner` via API; only seed/admin flows can set it (bypass by using raw SQL or a dedicated path). */
function stripUserIsOwnerFromMutationArgs(model: string, args: any) {
  if (model !== 'User') return;

  const strip = (data: Record<string, unknown> | undefined) => {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      'isOwner' in data
    ) {
      delete data.isOwner;
    }
  };

  if (args.data !== undefined) {
    if (Array.isArray(args.data)) {
      for (const row of args.data) strip(row as Record<string, unknown>);
    } else {
      strip(args.data);
    }
  }
  strip(args.create);
  strip(args.update);
}

async function handleIdsnowflake(model: string, args: any) {
  // 1. Single create
  if (args.data && !args.data.id) {
    args.data.id = snowflake.generate();
  }

  // 2. Upsert
  if (args.create && !args.create.id) {
    args.create.id = snowflake.generate();
  }

  // 3. createMany
  if (args.data && Array.isArray(args.data)) {
    for (const record of args.data) {
      if (!record.id) {
        record.id = snowflake.generate();
      }
    }
  }
}

async function handlePasswordHash(model: string, args: any) {
  if (model === 'User' && args.data?.password) {
    args.data.password = await hashHandler(args.data.password);
  }
}

function convert(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  // Preserve Date objects (they come from Prisma DateTime fields)
  if (obj instanceof Date) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(convert);
  if (typeof obj === 'object') {
    // Check if it's an empty object (might be a serialized Date issue)
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      // This might be a serialization artifact, skip it or return null
      return null;
    }
    const out: Record<string, any> = {};
    for (const key in obj) out[key] = convert(obj[key]);
    return out;
  }
  return obj;
}
