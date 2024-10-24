import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.answer.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.form.deleteMany({});
  await prisma.template.deleteMany({});
  await prisma.cloudinaryImage.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tag.deleteMany({});

  // Seed Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, index) => {
      return prisma.user.create({
        data: {
          email: `user${index + 1}@example.com`,
          password: `password${index + 1}`, // Use a hashed password in production
          name: `User ${index + 1}`,
          role: index === 0 ? "ADMIN" : "USER", // First user as admin
          language: index % 2 === 0 ? "ENGLISH" : "SPANISH", // Alternate languages
          theme: index % 2 === 0 ? "LIGHT" : "DARK", // Alternate themes
        },
      });
    })
  );

  console.log("Users created:", users);

  // Seed Cloudinary Images
  const cloudinaryImages = await Promise.all(
    Array.from({ length: 10 }).map((_, index) => {
      return prisma.cloudinaryImage.create({
        data: {
          publicId: `image${index + 1}`,
          url: `http://example.com/image${index + 1}.jpg`,
        },
      });
    })
  );

  console.log("Cloudinary Images:", cloudinaryImages);

  // Seed Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Education" } }),
    prisma.tag.create({ data: { name: "Quiz" } }),
    prisma.tag.create({ data: { name: "Feedback" } }),
    prisma.tag.create({ data: { name: "Survey" } }),
    prisma.tag.create({ data: { name: "General" } }),
  ]);

  console.log("Tags created:", tags);

  // Log IDs before creating templates
  console.log(
    "User IDs:",
    users.map((user) => user.id)
  );
  console.log(
    "Cloudinary Image IDs:",
    cloudinaryImages.map((image) => image.id)
  );
  console.log(
    "Tag IDs:",
    tags.map((tag) => tag.id)
  );

  // Seed Templates
  const templates = await Promise.all(
    Array.from({ length: 10 }).map((_, index) => {
      return prisma.template.create({
        data: {
          title: `Template ${index + 1}`,
          description: `Detailed description for Template ${
            index + 1
          }. This template covers various aspects related to ${
            tags[index % tags.length].name
          }.`,
          topic: index % 2 === 0 ? "General" : "Survey", // Alternate topics
          public: index % 2 === 0, // Alternate public status
          author: { connect: { id: users[index % users.length].id } }, // Connect to users in a round-robin fashion
          image: {
            connect: {
              id: cloudinaryImages[index % cloudinaryImages.length].id,
            },
          }, // Connect to cloudinary images in a round-robin fashion
          tags: {
            connect: [
              { id: tags[index % tags.length].id },
              { id: tags[(index + 1) % tags.length].id }, // Connect to the next tag
              { id: tags[(index + 2) % tags.length].id }, // Connect to the tag after that
            ],
          },
        },
      });
    })
  );

  console.log("Templates created:", templates);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
