/*
  Warnings:

  - You are about to drop the column `imageId` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the `CloudinaryImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_imageId_fkey";

-- DropIndex
DROP INDEX "Template_imageId_key";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "imageId",
ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "CloudinaryImage";
