/*
  Warnings:

  - A unique constraint covering the columns `[hierarchy]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "hierarchy" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Role_hierarchy_key" ON "Role"("hierarchy");
