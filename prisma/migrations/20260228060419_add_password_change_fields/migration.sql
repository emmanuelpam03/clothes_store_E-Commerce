-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password_change_deadline" TIMESTAMP(3),
ADD COLUMN     "require_password_change" BOOLEAN NOT NULL DEFAULT false;
