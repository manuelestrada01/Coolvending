import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { validateContactForm, validateNewsletterEmail } from "../../shared/utils/validators";

const CONTACT_LIMIT = 5;   // max submissions per email in 10 min
const WINDOW_MS    = 10 * 60 * 1000;

export async function saveContactMessage(data) {
  const { ok, errors } = validateContactForm(data);
  if (!ok) throw new Error("Datos de contacto inválidos: " + JSON.stringify(errors));

  // Basic rate-limit: query by email only (no composite index needed), filter window locally
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

export async function savePresupuesto(data) {
  return addDoc(collection(db, "presupuestos"), {
    nombre: data.nombre,
    email: data.email || "",
    mensaje: data.mensaje || "",
    maquinas: data.maquinas,
    canal: data.canal,
    creadoEn: serverTimestamp(),
  });
}
