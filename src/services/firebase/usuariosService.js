import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Devuelve todos los documentos de la colección `users`.
 * Solo el admin puede ejecutar esto (regla Firestore).
 */
export async function getUsuarios() {
  const q = query(collection(db, "users"), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Habilita o deshabilita el acceso a precios para un usuario.
 * Solo modifica el campo `puedeVerPrecios` — nada más.
 */
export async function setPuedeVerPrecios(uid, value) {
  await updateDoc(doc(db, "users", uid), { puedeVerPrecios: value });
}
