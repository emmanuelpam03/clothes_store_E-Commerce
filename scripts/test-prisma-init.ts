import { registerUser } from "../services/auth.service";

async function main() {
  try {
    console.log(
      "Calling registerUser to trigger Prisma client initialization..."
    );
    await registerUser(
      "Test User",
      `test+copilot+${Date.now()}@example.com`,
      "secret123"
    );
    console.log("registerUser completed (unexpected — DB likely present)");
  } catch (err) {
    console.error("registerUser threw:", err);
  }
}

main().finally(() => process.exit());
