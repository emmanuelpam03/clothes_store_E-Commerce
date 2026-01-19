/*
  Warnings:

  - You are about to drop the column `token` on the `email_verification_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `email_verification_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "email_verification_tokens_token_key";

-- AlterTable
ALTER TABLE "email_verification_tokens" DROP COLUMN "token",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "code" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_userId_key" ON "email_verification_tokens"("userId");
