import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { validateContactForm, validateNewsletterEmail } from "../../shared/utils/validators";

const CONTACT_LIMIT = 5;   // max submissions per email in 10 min
const WINDOW_MS    = 10 * 60 * 1000;

export async function saveContactMessage(data) {
  const { ok, errors } = validateContactForm(data);
  if (!ok) throw new Error("Datos de contacto inválidos: " + JSON.stringify(errors));

  // Basic rate-limit: query by email only (no composite index needed), filter window locally
  try {
    const snap = await getDocs(
      query(
        collection(db, "contactos"),
        where("email", "==", data.email.trim().toLowerCase())
      )
    );
    const windowStart = Date.now() - WINDOW_MS;
    const recent = snap.docs.filter((d) => {
      const ts = d.data().creadoEn;
      return ts && ts.toMillis() >= windowStart;
    });
    if (recent.length >= CONTACT_LIMIT) {
      throw new Error("rate_limit");
    }
  } catch (err) {
    if (err.message === "rate_limit") throw err;
    // Si no hay permisos para leer, ignoramos el rate limit y continuamos
  }

  // Solo persiste campos conocidos — nunca spread de input sin filtrar
  return addDoc(collection(db, "contactos"), {
    nombre: data.nombre.trim(),
    email: data.email.trim().toLowerCase(),
    telefono: (data.telefono ?? "").trim(),
    mensaje: data.mensaje.trim(),
    creadoEn: serverTimestamp(),
  });
}

export async function saveNewsletterEmail(email) {
  const err = validateNewsletterEmail(email);
  if (err) throw new Error(err);

  return addDoc(collection(db, "newsletter"), {
    email: email.trim().toLowerCase(),
    creadoEn: serverTimestamp(),
  });
}

async function generarNumeroPresupuesto() {
  const counterRef = doc(db, "counters", "presupuestos");
  const year = new Date().getFullYear().toString().slice(-2);
  const num = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = snap.exists() ? snap.data().ultimo + 1 : 1;
    tx.set(counterRef, { ultimo: next, year });
    return next;
  });
  return `${String(num).padStart(3, "0")}/${year}`;
}

export async function savePresupuesto(data) {
  const numero = await generarNumeroPresupuesto();
  const docRef = await addDoc(collection(db, "presupuestos"), {
    nombre: data.nombre,
    email: data.email || "",
    telefono: data.telefono || "",
    mensaje: data.mensaje || "",
    maquinas: data.maquinas,
    insumos: data.insumos || [],
    canal: data.canal,
    numero,
    creadoEn: serverTimestamp(),
  });
  return { docId: docRef.id, numero };
}
