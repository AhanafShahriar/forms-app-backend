-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_imageId_fkey";

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "CloudinaryImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
