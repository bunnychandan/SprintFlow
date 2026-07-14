import { prisma } from "./src/lib/prisma";

async function checkRecords() {
  console.log("=== Checking User Records ===");
  const user = await prisma.user.findUnique({
    where: { email: "chandan.sweyainfo@gmail.com" },
    include: { accounts: true },
  });
  console.log(JSON.stringify(user, null, 2));

  console.log("\n=== Checking All Google Accounts ===");
  const accounts = await prisma.account.findMany({
    where: { provider: "google" },
  });
  console.log(`Found ${accounts.length} Google accounts`);
  console.log(JSON.stringify(accounts, null, 2));

  await prisma.$disconnect();
}

checkRecords().catch(console.error);
