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

const USERS = [
  {
    label: "admin_001",
    email: "john.smith@humanesociety.com",
    password: "Passw0rd!",
    displayName: "John Smith",
  },
  {
    label: "admin_002",
    email: "sarah.johnson@humanesociety.com",
    password: "Passw0rd!",
    displayName: "Sarah Johnson",
  },
  {
    label: "behaviourist_001",
    email: "emily.wilson@humanesociety.com",
    password: "Passw0rd!",
    displayName: "Emily Wilson",
  },
  {
    label: "behaviourist_002",
    email: "michael.brown@humanesociety.com",
    password: "Passw0rd!",
    displayName: "Michael Brown",
  },
  {
    label: "staff_001",
    email: "lisa.davis@humanesociety.com",
    password: "Passw0rd!",
    displayName: "Lisa Davis",
  },
  {
    label: "staff_002",
    email: "robert.miller@humanesociety.com",
    password: "Passw0rd!",
    displayName: "Robert Miller",
  },
  {
    label: "volunteer_001",
    email: "amanda.garcia@volunteer.com",
    password: "Passw0rd!",
    displayName: "Amanda Garcia",
  },
  {
    label: "volunteer_002",
    email: "kevin.martinez@volunteer.com",
    password: "Passw0rd!",
    displayName: "Kevin Martinez",
  },
];

(async () => {
  const map: Record<string, string> = {};
  for (const u of USERS) {
    try {
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
  const outPath = path.resolve(__dirname, "../seeders/seed-auth-map.json");
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2));
  console.log("Wrote UID map:", outPath, map);
  process.exit(0);
})();
