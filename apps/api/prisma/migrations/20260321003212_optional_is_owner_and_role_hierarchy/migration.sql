-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "hierarchy" DROP NOT NULL,
ALTER COLUMN "hierarchy" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOwner" BOOLEAN;
