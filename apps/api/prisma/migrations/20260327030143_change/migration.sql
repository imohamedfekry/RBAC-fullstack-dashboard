/*
  Warnings:

  - You are about to drop the column `permission` on the `Role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "permission",
ADD COLUMN     "permissions" INTEGER NOT NULL DEFAULT 0;
