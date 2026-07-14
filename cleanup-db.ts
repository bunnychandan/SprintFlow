import { prisma } from "./src/lib/prisma";

async function cleanup() {
  try {
    console.log("=== Cleaning up stale records ===");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: "chandan.sweyainfo@gmail.com" },
      include: { accounts: true, sessions: true },
    });

    if (user) {
      console.log("Found user:", { id: user.id, email: user.email, accountCount: user.accounts.length });

      if (user.accounts.length === 0) {
        console.log("User has no linked accounts - deleting stale record...");
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log("✓ Deleted stale user record");
      } else {
        console.log("User already has linked accounts:", user.accounts.map((a: { provider: string }) => a.provider));
      }
    } else {
      console.log("No user found with that email - fresh start");
    }

    console.log("\n=== Cleanup complete ===");
  } catch (error) {
    console.error("Cleanup error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
