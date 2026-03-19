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

export async function getMaquinas() {
  const q = query(collection(db, "maquinas"), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

export async function addMaquina(data, imageFile, galeriaFiles = []) {
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

  return addDoc(collection(db, "maquinas"), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    galeria,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export async function updateMaquina(id, data, imageFile, galeriaFiles = [], galeriaExistente = []) {
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

  return updateDoc(doc(db, "maquinas", id), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    galeria,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteMaquina(id, imagenPath, galeria = []) {
  await removeImage(imagenPath);
  for (const item of galeria) {
    await removeImage(item.path);
  }
  return deleteDoc(doc(db, "maquinas", id));
}

export { removeImage };
