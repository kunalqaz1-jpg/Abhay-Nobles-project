import bcryptjs from "bcryptjs";
import { AdminUser, connectDB } from "@workspace/db";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return "";
  return process.argv[index + 1] ?? "";
}

async function main() {
  const username = readArg("--username").trim();
  const password = readArg("--password");

  if (!username || !password) {
    console.error("Usage: pnpm --filter @workspace/scripts run admin:create -- --username <username> --password <password>");
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const passwordHash = await bcryptjs.hash(password, 10);
  const existing = await AdminUser.findOne({ username });

  await AdminUser.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(existing ? `Updated admin user: ${username}` : `Created admin user: ${username}`);
}

main().catch((error) => {
  console.error("Failed to create admin user.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
