// Run once to seed Firestore: node src/data/seed-runner.js
// Requires .env with VITE_FIREBASE_* variables

import { config } from "dotenv";
config({ path: ".env" });

// Manually shim import.meta.env for the seed runner (runs in Node, not Vite)
process.env.VITE_FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || "";
const envShim = Object.fromEntries(
  Object.entries(process.env)
    .filter(([k]) => k.startsWith("VITE_"))
    .map(([k, v]) => [k, v])
);
// Patch global for firebase.js import
globalThis.importMeta_env = envShim;

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { WORKFLOWS } from "./seed.js";

const cfg = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(cfg);
const db  = getFirestore(app);

async function seed() {
  const col = collection(db, "workflows");

  // Clear existing
  const existing = await getDocs(col);
  for (const d of existing.docs) await deleteDoc(doc(db, "workflows", d.id));
  console.log("Cleared existing workflows.");

  // Insert
  for (const wf of WORKFLOWS) {
    await addDoc(col, { ...wf, createdAt: Date.now(), updatedAt: Date.now() });
    console.log(`Seeded: ${wf.slug}`);
  }

  console.log("Done seeding Firestore.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
