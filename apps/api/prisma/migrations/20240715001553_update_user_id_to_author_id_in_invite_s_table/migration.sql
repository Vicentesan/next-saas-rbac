/*
  Warnings:

  - You are about to drop the column `userId` on the `invites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_userId_fkey";

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
