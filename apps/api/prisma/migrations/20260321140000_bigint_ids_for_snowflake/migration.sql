-- Snowflake IDs require BIGINT. Drop FKs first, drop SERIAL defaults, then widen columns.

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- Drop SERIAL / sequence defaults so IDs can be supplied explicitly (e.g. snowflakes)
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "Permission" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "RolePermission" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "UserRole" ALTER COLUMN "id" DROP DEFAULT;

-- AlterColumn (INTEGER -> BIGINT)
ALTER TABLE "User" ALTER COLUMN "id" TYPE BIGINT USING "id"::BIGINT;
ALTER TABLE "Role" ALTER COLUMN "id" TYPE BIGINT USING "id"::BIGINT;
ALTER TABLE "Permission" ALTER COLUMN "id" TYPE BIGINT USING "id"::BIGINT;
ALTER TABLE "RolePermission" ALTER COLUMN "id" TYPE BIGINT USING "id"::BIGINT;
ALTER TABLE "RolePermission" ALTER COLUMN "roleId" TYPE BIGINT USING "roleId"::BIGINT;
ALTER TABLE "RolePermission" ALTER COLUMN "permissionId" TYPE BIGINT USING "permissionId"::BIGINT;
ALTER TABLE "UserRole" ALTER COLUMN "id" TYPE BIGINT USING "id"::BIGINT;
ALTER TABLE "UserRole" ALTER COLUMN "userId" TYPE BIGINT USING "userId"::BIGINT;
ALTER TABLE "UserRole" ALTER COLUMN "roleId" TYPE BIGINT USING "roleId"::BIGINT;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
