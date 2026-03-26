-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "hierarchy" SET DEFAULT 0;

-- AlterTable
CREATE SEQUENCE rolepermission_id_seq;
ALTER TABLE "RolePermission" ALTER COLUMN "id" SET DEFAULT nextval('rolepermission_id_seq');
ALTER SEQUENCE rolepermission_id_seq OWNED BY "RolePermission"."id";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "User_user_key";
