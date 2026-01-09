/*
  Warnings:

  - You are about to drop the column `readAt` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "readAt",
ADD COLUMN     "read_at" TIMESTAMP(3);
