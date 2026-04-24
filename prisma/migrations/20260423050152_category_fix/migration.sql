/*
  Warnings:

  - The values [DELETED] on the enum `CommentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `color` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Category` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommentStatus_new" AS ENUM ('ACTIVE', 'HIDDEN');
ALTER TABLE "public"."Comment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Comment" ALTER COLUMN "status" TYPE "CommentStatus_new" USING ("status"::text::"CommentStatus_new");
ALTER TYPE "CommentStatus" RENAME TO "CommentStatus_old";
ALTER TYPE "CommentStatus_new" RENAME TO "CommentStatus";
DROP TYPE "public"."CommentStatus_old";
ALTER TABLE "Comment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "color",
DROP COLUMN "description",
DROP COLUMN "icon";
