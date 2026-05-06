import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { validateMaquinaForm, validateImageFile } from "../../shared/utils/validators";

let _maquinasCache = null;
let _maquinasCacheAt = 0;
let _maquinasInflight = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function _fetchMaquinas() {
  if (_maquinasInflight) return _maquinasInflight;
  const q = query(collection(db, "maquinas"), orderBy("creadoEn", "desc"));
  _maquinasInflight = getDocs(q).then((snap) => {
    _maquinasCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    _maquinasCacheAt = Date.now();
    _maquinasInflight = null;
    return _maquinasCache;
  }).catch((err) => {
    _maquinasInflight = null;
    throw err;
  });
  return _maquinasInflight;
}

// Warm-up: inicia el fetch al importar el módulo, sin esperar al montaje del componente
_fetchMaquinas();

export async function getMaquinas({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && _maquinasCache && now - _maquinasCacheAt < CACHE_TTL) {
    return _maquinasCache;
  }
  return _fetchMaquinas();
}

export function invalidateMaquinasCache() {
  _maquinasCache = null;
  _maquinasCacheAt = 0;
  _maquinasInflight = null;
}

export async function getMaquinaById(id) {
  const snap = await getDoc(doc(db, "maquinas", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

const ALLOWED_COLLECTIONS = new Set(["maquinas", "contactos", "newsletter", "eventos", "insumos"]);

export async function countCollection(colName) {
  if (!ALLOWED_COLLECTIONS.has(colName)) {
    throw new Error(`Colección no permitida: ${colName}`);
  }
  const snap = await getCountFromServer(collection(db, colName));
  return snap.data().count;
}

async function uploadImage(imageFile, folder = "maquinas") {
  const imgError = validateImageFile(imageFile);
  if (imgError) throw new Error(imgError);

  const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, imageFile);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

async function removeImage(imagenPath) {
  if (!imagenPath) return;
  if (!imagenPath.startsWith("maquinas/")) return;
  try {
    await deleteObject(ref(storage, imagenPath));
  } catch (e) {
    if (import.meta.env.DEV) console.error("Error deleting image:", e);
  }
}

function sanitizeMaquinaPayload(data) {
  return {
    nombre: data.nombre.trim(),
    categoria: data.categoria,
    descripcion: data.descripcion.trim(),
    badge: typeof data.badge === "string" ? data.badge.trim() : "",
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 3)
      : [],
  };
}

export async function addMaquina(data, imageFile, galeriaFiles = [], detalleFiles = []) {
  const { ok, errors } = validateMaquinaForm(data);
  if (!ok) throw new Error("Datos de máquina inválidos: " + JSON.stringify(errors));

  let imagenURL = "";
  let imagenPath = "";
  if (imageFile) {
    const result = await uploadImage(imageFile);
    imagenURL = result.url;
    imagenPath = result.path;
  }

  const galeria = [];
  for (const file of galeriaFiles.slice(0, 5)) {
    const result = await uploadImage(file);
    galeria.push({ url: result.url, path: result.path });
  }

  const detalleImagenes = [];
  for (const file of detalleFiles.slice(0, 8)) {
    const result = await uploadImage(file);
    detalleImagenes.push({ url: result.url, path: result.path });
  }

  return addDoc(collection(db, "maquinas"), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    galeria,
    detalleImagenes,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export async function updateMaquina(id, data, imageFile, galeriaFiles = [], galeriaExistente = [], detalleFiles = [], detalleExistente = []) {
  const { ok, errors } = validateMaquinaForm(data);
  if (!ok) throw new Error("Datos de máquina inválidos: " + JSON.stringify(errors));

  let { imagenURL, imagenPath } = data;
  if (imageFile) {
    await removeImage(imagenPath);
    const result = await uploadImage(imageFile);
    imagenURL = result.url;
    imagenPath = result.path;
  }

  // Upload new galeria files and merge with existing ones kept
  const galeria = [...galeriaExistente];
  for (const file of galeriaFiles.slice(0, Math.max(0, 5 - galeria.length))) {
    const result = await uploadImage(file);
    galeria.push({ url: result.url, path: result.path });
  }

  // Upload new detalle files and merge with existing ones kept
  const detalleImagenes = [...detalleExistente];
  for (const file of detalleFiles.slice(0, Math.max(0, 8 - detalleImagenes.length))) {
    const result = await uploadImage(file);
    detalleImagenes.push({ url: result.url, path: result.path });
  }

  return updateDoc(doc(db, "maquinas", id), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    galeria,
    detalleImagenes,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteMaquina(id, imagenPath, galeria = [], detalleImagenes = []) {
  await removeImage(imagenPath);
  for (const item of galeria) {
    await removeImage(item.path);
  }
  for (const item of detalleImagenes) {
    await removeImage(item.path);
  }
  return deleteDoc(doc(db, "maquinas", id));
}

export { removeImage };
