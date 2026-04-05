import bcrypt from "bcryptjs";
import User from "../models/user.model.js";


export async function ensureSeedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = (process.env.SEED_ADMIN_NAME || "Admin").trim();

  if (!email || !password) {
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email }).select("+password");

  if (existing) {
    existing.name = name;
    existing.role = "admin";
    existing.isActive = true;
    existing.password = hashed;
    await existing.save();
    console.log(`[seed] Ensured admin: ${email} (role + password synced from .env)`);
  } else {
    await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      isActive: true,
    });
    console.log(`[seed] Created admin: ${email}`);
  }
}
