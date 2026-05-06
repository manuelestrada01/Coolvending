import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const VERIFICAR_URL =
  "https://us-central1-coolvending-e258f.cloudfunctions.net/verificarPagoMP";

const CONFIG_DOC = doc(db, "sorteo_config", "activo");
const PART_COL = collection(db, "sorteo_participantes");

// ─── Config ────────────────────────────────────────────────────────────────

export async function getSorteoConfig() {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function setSorteoConfig(data) {
  await setDoc(CONFIG_DOC, data, { merge: true });
}

// ─── Participantes ──────────────────────────────────────────────────────────

export async function getParticipantes(estado = null) {
  let q;
  if (estado) {
    q = query(PART_COL, where("estado", "==", estado), orderBy("creadoEn", "desc"));
  } else {
    q = query(PART_COL, orderBy("creadoEn", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Registra un participante.
 * 1. Verifica unicidad del operacionId en Firestore.
 * 2. Llama a la Cloud Function que valida el pago en MercadoPago.
 * 3. Guarda como "aprobado" si es válido.
 */
export async function registrarParticipante({ nombre, operacionId, telefono = "", instagram = "" }) {
  const nombreLimpio = nombre.trim();
  const opId = operacionId.trim().replace(/\s+/g, "");

  if (!nombreLimpio) throw new Error("El nombre es obligatorio.");
  if (!/^\d{8,20}$/.test(opId))
    throw new Error("El número de operación debe tener solo dígitos (8 a 20).");

  // Verificar que el operacionId no esté ya registrado
  const existe = await getDocs(query(PART_COL, where("operacionId", "==", opId)));
  if (!existe.empty) throw new Error("Este número de operación ya fue registrado.");

  // Obtener config del sorteo para validar fechas
  const cfg = await getSorteoConfig();

  // Verificar pago en MercadoPago via Cloud Function
  const mpRes = await fetch(VERIFICAR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operacionId: opId }),
  });
  const mpData = await mpRes.json();
  if (!mpRes.ok) {
    throw new Error(mpData.error || "Error al verificar el pago.");
  }

  // Validar que la fecha del pago esté dentro del período del sorteo
  if (cfg?.fechaInicio || cfg?.fechaFin) {
    const fechaPago = mpData.fecha ? new Date(mpData.fecha) : null;
    if (fechaPago) {
      if (cfg.fechaInicio && fechaPago < new Date(cfg.fechaInicio)) {
        throw new Error(
          `Este pago es anterior al inicio del sorteo (${new Date(cfg.fechaInicio).toLocaleDateString("es-AR")}).`
        );
      }
      if (cfg.fechaFin && fechaPago > new Date(cfg.fechaFin)) {
        throw new Error(
          `Este pago es posterior al cierre del sorteo (${new Date(cfg.fechaFin).toLocaleDateString("es-AR")}).`
        );
      }
    }
  }

  return addDoc(PART_COL, {
    nombre: nombreLimpio,
    operacionId: opId,
    telefono: telefono.trim(),
    instagram: instagram.trim(),
    estado: "aprobado",
    creadoEn: serverTimestamp(),
  });
}

export async function agregarParticipanteManual({ nombre, operacionId }) {
  const nombreLimpio = nombre.trim();
  const opId = operacionId.trim().replace(/\s+/g, "");
  if (!nombreLimpio) throw new Error("El nombre es obligatorio.");
  if (!opId) throw new Error("El número de operación es obligatorio.");
  const existe = await getDocs(query(PART_COL, where("operacionId", "==", opId)));
  if (!existe.empty) throw new Error("Ese número de operación ya existe.");
  return addDoc(PART_COL, {
    nombre: nombreLimpio,
    operacionId: opId,
    estado: "aprobado",
    creadoEn: serverTimestamp(),
    manual: true,
  });
}

export async function eliminarParticipante(id) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "sorteo_participantes", id));
}

// ─── Sortear ganador ────────────────────────────────────────────────────────

export async function sortearGanador() {
  const aprobados = await getParticipantes("aprobado");
  if (aprobados.length === 0) throw new Error("No hay participantes aprobados.");
  const ganador = aprobados[Math.floor(Math.random() * aprobados.length)];
  await setSorteoConfig({
    ganador: {
      nombre: ganador.nombre,
      operacionId: ganador.operacionId,
      timestamp: new Date().toISOString(),
    },
  });
  return ganador;
}

export async function limpiarGanador() {
  await setSorteoConfig({ ganador: null });
}

// ─── Sorteo en vivo ─────────────────────────────────────────────────────────

/**
 * Elige un participante al azar excluyendo IDs ya utilizados.
 * @param {string[]} excludedIds - IDs de participantes a excluir (ya ganaron o fueron saltados)
 */
export async function sortearGanadorPremio(excludedIds = []) {
  const aprobados = await getParticipantes("aprobado");
  const elegibles = excludedIds.length > 0
    ? aprobados.filter((p) => !excludedIds.includes(p.id))
    : aprobados;
  if (elegibles.length === 0)
    throw new Error("No hay participantes elegibles para este premio.");
  return elegibles[Math.floor(Math.random() * elegibles.length)];
}

/**
 * Guarda la lista de ganadores por premio en la config del sorteo.
 * @param {Array<{lugar: number, nombre: string}>} ganadoresPremios
 */
export async function guardarGanadoresPremios(ganadoresPremios) {
  await setSorteoConfig({ ganadoresPremios });
}

// ─── Eliminar sorteo completo ───────────────────────────────────────────────

export async function eliminarSorteo() {
  const { deleteDoc, writeBatch } = await import("firebase/firestore");
  // 1. Borrar todos los participantes en batch
  const snap = await getDocs(PART_COL);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  // 2. Borrar el doc de config
  await deleteDoc(CONFIG_DOC);
}
