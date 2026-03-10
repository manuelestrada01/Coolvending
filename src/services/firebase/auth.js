import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { validateRegisterForm, validateLoginForm } from "../../shared/utils/validators";

const googleProvider = new GoogleAuthProvider();

export async function register(nombre, email, password, confirm) {
  const { ok, errors } = validateRegisterForm({ nombre, email, password, confirm: confirm ?? password });
  if (!ok) {
    const first = Object.values(errors)[0];
    const err = new Error(first);
    err.validationErrors = errors;
    throw err;
  }

  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(user, { displayName: nombre.trim() });

  // role is hardcoded to "usuario" — never trust client to send this
  await setDoc(doc(db, "users", user.uid), {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    role: "usuario",
    creadoEn: serverTimestamp(),
  });
  return user;
}

export async function login(email, password) {
  const { ok, errors } = validateLoginForm({ email, password });
  if (!ok) {
    const first = Object.values(errors)[0];
    const err = new Error(first);
    err.validationErrors = errors;
    throw err;
  }
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
  return user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Only create the Firestore doc on first login — never overwrite existing role
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre: user.displayName ?? "",
      email: user.email?.toLowerCase() ?? "",
      role: "usuario",
      creadoEn: serverTimestamp(),
    });
  }
  return user;
}

export function logout() {
  return signOut(auth);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : "usuario";
}
