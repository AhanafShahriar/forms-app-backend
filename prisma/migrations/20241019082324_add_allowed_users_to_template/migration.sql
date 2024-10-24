-- CreateTable
CREATE TABLE "_AllowedTemplateUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AllowedTemplateUsers_AB_unique" ON "_AllowedTemplateUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_AllowedTemplateUsers_B_index" ON "_AllowedTemplateUsers"("B");

-- AddForeignKey
ALTER TABLE "_AllowedTemplateUsers" ADD CONSTRAINT "_AllowedTemplateUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedTemplateUsers" ADD CONSTRAINT "_AllowedTemplateUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
