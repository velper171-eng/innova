const { execSync } = require('child_process');

console.log("Starting database setup...");

try {
  // Always run prisma generate
  console.log("Generating Prisma Client...");
  execSync('npm run prisma:generate --prefix server', { stdio: 'inherit' });

  // Run db push only if DATABASE_URL is defined
  if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL found. Running prisma db push...");
    execSync('npm run prisma:db --prefix server', { stdio: 'inherit' });
  } else {
    console.log("No DATABASE_URL found. Skipping db push (Prisma client generated).");
  }
} catch (error) {
  console.error("Database setup failed:", error);
  process.exit(1);
}
