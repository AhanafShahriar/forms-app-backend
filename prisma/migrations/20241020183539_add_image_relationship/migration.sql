/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_id_fkey";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "imageId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Template_imageId_key" ON "Template"("imageId");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CloudinaryImage"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;
