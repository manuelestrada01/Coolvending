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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { validateImageFile, validateInsumoForm } from "../../shared/utils/validators";

async function uploadInsumoImage(file, insumoId) {
  const err = validateImageFile(file);
  if (err) throw new Error(err);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `insumos/${insumoId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

async function removeInsumoImage(path) {
  if (!path || !path.startsWith("insumos/")) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // ignore — may already be deleted
  }
}

function sanitizeInsumoPayload(data) {
  return {
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim(),
    precio: Number(data.precio) || 0,
    maquina: data.maquina.trim(),
    cantidad: data.cantidad ? data.cantidad.trim() : "",
  };
}

export async function getInsumos() {
  const q = query(collection(db, "insumos"), orderBy("creadoEn", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getInsumoById(id) {
  const snap = await getDoc(doc(db, "insumos", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addInsumo(data, imageFile) {
  const { ok, errors } = validateInsumoForm(data);
  if (!ok) throw new Error("Datos de insumo inválidos: " + JSON.stringify(errors));

  const docRef = await addDoc(collection(db, "insumos"), {
    ...sanitizeInsumoPayload(data),
    imagenURL: "",
    imagenPath: "",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  if (imageFile) {
    const { url, path } = await uploadInsumoImage(imageFile, docRef.id);
    await updateDoc(docRef, { imagenURL: url, imagenPath: path });
  }

  return docRef;
}

export async function updateInsumo(id, data, imageFile) {
  const { ok, errors } = validateInsumoForm(data);
  if (!ok) throw new Error("Datos de insumo inválidos: " + JSON.stringify(errors));

  let imagenURL = data.imagenURL ?? "";
  let imagenPath = data.imagenPath ?? "";

  if (imageFile) {
    await removeInsumoImage(imagenPath);
    const uploaded = await uploadInsumoImage(imageFile, id);
    imagenURL = uploaded.url;
    imagenPath = uploaded.path;
  }

  return updateDoc(doc(db, "insumos", id), {
    ...sanitizeInsumoPayload(data),
    imagenURL,
    imagenPath,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteInsumo(id, imagenPath) {
  await removeInsumoImage(imagenPath);
  return deleteDoc(doc(db, "insumos", id));
}
