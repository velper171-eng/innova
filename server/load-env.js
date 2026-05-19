import dotenv from "dotenv";
import fs from "fs";
import path from "path";

if (fs.existsSync(path.join(process.cwd(), "server", ".env"))) {
  dotenv.config({ path: path.join(process.cwd(), "server", ".env") });
} else {
  dotenv.config();
}
