/* eslint-disable */
import * as fs from "fs";
import * as path from "path";
import admin from "firebase-admin";
import "dotenv/config";

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    "Set FIREBASE_AUTH_EMULATOR_HOST (e.g., host.docker.internal:9099).",
  );
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "uw-blueprint-starter-code",
  });
}

const auth = admin.auth();

const USERS: Array<{ label: string; email: string; password: string; displayName: string }> = require(
  path.resolve(__dirname, "../seeders/mockData/auth.json")
);

(async () => {
  // label -> uid map
  const map: Record<string, string> = {};
  for (const u of USERS) {
    try {
      // reuse user if in emulator already
      const ex = await auth.getUserByEmail(u.email);
      map[u.label] = ex.uid;
    } catch {
      const created = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true,
      });
      map[u.label] = created.uid;
    }
  }

  // Seeder files will consume this to map something like "admin_001" -> actual UID
  const outPath = path.resolve(__dirname, "../seeders/seed-auth-map.json");
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
  console.log("Wrote UID map:", outPath, map);
  process.exit(0);
})();
