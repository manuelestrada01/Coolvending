import {
  collection,
  addDoc,
  getDocs,
  doc,
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

const ALLOWED_COLLECTIONS = new Set(["maquinas", "contactos", "newsletter", "eventos", "insumos"]);

export async function countCollection(colName) {
  if (!ALLOWED_COLLECTIONS.has(colName)) {
    throw new Error(`Colección no permitida: ${colName}`);
  }
  const snap = await getCountFromServer(collection(db, colName));
  return snap.data().count;
}

async function uploadImage(imageFile) {
  const imgError = validateImageFile(imageFile);
  if (imgError) throw new Error(imgError);

  // Sanitize filename: strip any path traversal / special chars
  const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `maquinas/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, imageFile);
  const url = await getDownloadURL(storageRef);
  return { imagenURL: url, imagenPath: path };
}

async function removeImage(imagenPath) {
  if (!imagenPath) return;
  // Prevent path traversal: only allow paths inside the maquinas/ prefix
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

export async function addMaquina(data, imageFile) {
  const { ok, errors } = validateMaquinaForm(data);
  if (!ok) throw new Error("Datos de máquina inválidos: " + JSON.stringify(errors));

  let imagenURL = "";
  let imagenPath = "";
  if (imageFile) {
    ({ imagenURL, imagenPath } = await uploadImage(imageFile));
  }

  return addDoc(collection(db, "maquinas"), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export async function updateMaquina(id, data, imageFile) {
  const { ok, errors } = validateMaquinaForm(data);
  if (!ok) throw new Error("Datos de máquina inválidos: " + JSON.stringify(errors));

  let { imagenURL, imagenPath } = data;
  if (imageFile) {
    await removeImage(imagenPath);
    ({ imagenURL, imagenPath } = await uploadImage(imageFile));
  }

  return updateDoc(doc(db, "maquinas", id), {
    ...sanitizeMaquinaPayload(data),
    imagenURL,
    imagenPath,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteMaquina(id, imagenPath) {
  await removeImage(imagenPath);
  return deleteDoc(doc(db, "maquinas", id));
}
