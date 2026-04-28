import {
  collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc,
  orderBy, query,
} from "firebase/firestore";
import { db } from "../firebase";
import { WORKFLOWS } from "../data/seed";

const COL = "workflows";

// Public landing — falls back to seed if Firestore is empty
export async function getWorkflows() {
  if (!db) return WORKFLOWS;
  const q = query(collection(db, COL), orderBy("order", "asc"));
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return results.length > 0 ? results : WORKFLOWS;
}

// Admin panel — only real Firestore data, no seed fallback
export async function getWorkflowsAdmin() {
  if (!db) throw new Error("Firebase no configurado");
  const q = query(collection(db, COL), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getWorkflow(id) {
  if (!db) return WORKFLOWS.find(w => w.id === id || w.slug === id) || null;
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createWorkflow(data) {
  if (!db) throw new Error("Firebase no configurado — agrega .env con las credenciales");
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateWorkflow(id, data) {
  if (!db) throw new Error("Firebase no configurado");
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: Date.now() });
}

export async function deleteWorkflow(id) {
  if (!db) throw new Error("Firebase no configurado");
  await deleteDoc(doc(db, COL, id));
}
