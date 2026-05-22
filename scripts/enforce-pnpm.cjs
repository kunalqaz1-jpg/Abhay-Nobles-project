const fs = require("fs");
const path = require("path");

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  const lockfilePath = path.join(__dirname, "..", lockfile);
  if (fs.existsSync(lockfilePath)) {
    fs.unlinkSync(lockfilePath);
  }
}

const userAgent = process.env.npm_config_user_agent || "";

if (userAgent && !userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
