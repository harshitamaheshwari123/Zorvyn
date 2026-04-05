import app from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { ensureSeedAdmin } from "./src/seed/ensureSeedAdmin.js";

dotenv.config();

async function start() {
  await connectDB();
  await ensureSeedAdmin();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
