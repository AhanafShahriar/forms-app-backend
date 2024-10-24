// prisma/clear.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.form.deleteMany({});
  await prisma.cloudinaryImage.deleteMany({});
  await prisma.template.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.question.deleteMany({});
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
