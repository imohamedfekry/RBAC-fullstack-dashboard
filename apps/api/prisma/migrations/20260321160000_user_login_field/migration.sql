-- Align User with schema: login field `user` (was `email`), drop unused `name`.

ALTER TABLE "User" RENAME COLUMN "email" TO "user";

ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
