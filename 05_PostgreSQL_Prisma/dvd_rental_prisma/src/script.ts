import { prisma } from "./lib/prisma";

async function main() {
  const allActors = await prisma.actor.findMany();
  console.log("All actors:", JSON.stringify(allActors, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
