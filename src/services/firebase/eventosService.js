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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { validateImageFile } from "../../shared/utils/validators";

const MAX_PHOTOS = 3;

async function uploadEventoPhoto(file, eventoId) {
  const err = validateImageFile(file);
  if (err) throw new Error(err);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `eventos/${eventoId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

async function removePhoto(path) {
  if (!path || !path.startsWith("eventos/")) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // ignore — file may already be deleted
  }
}

function sanitizeEventoPayload(data) {
  return {
    titulo: data.titulo.trim(),
    ubicacion: data.ubicacion.trim(),
    detalle: data.detalle.trim(),
    invitados: typeof data.invitados === "string" ? data.invitados.trim() : "",
    categoria: data.categoria.trim(),
    fecha: data.fecha,
  };
}

export async function getEventos() {
  const q = query(collection(db, "eventos"), orderBy("creadoEn", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addEvento(data, files = []) {
  const docRef = await addDoc(collection(db, "eventos"), {
    ...sanitizeEventoPayload(data),
    fotos: [],
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  const fotos = [];
  for (const file of files.slice(0, MAX_PHOTOS)) {
    const photo = await uploadEventoPhoto(file, docRef.id);
    fotos.push(photo);
  }

  if (fotos.length > 0) {
    await updateDoc(docRef, { fotos });
  }
  return docRef;
}

export async function updateEvento(id, data, newFiles = [], removedPaths = []) {
  for (const path of removedPaths) {
    await removePhoto(path);
  }

  const existingFotos = (data.fotos || []).filter((f) => !removedPaths.includes(f.path));
  const newFotos = [];
  const availableSlots = MAX_PHOTOS - existingFotos.length;

  for (const file of newFiles.slice(0, availableSlots)) {
    const photo = await uploadEventoPhoto(file, id);
    newFotos.push(photo);
  }

  return updateDoc(doc(db, "eventos", id), {
    ...sanitizeEventoPayload(data),
    fotos: [...existingFotos, ...newFotos],
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteEvento(id, fotos = []) {
  for (const f of fotos) {
    await removePhoto(f.path);
  }
  return deleteDoc(doc(db, "eventos", id));
}
