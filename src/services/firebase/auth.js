import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
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


async function ensureFirestoreUser(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre: user.displayName ?? "",
      email: user.email?.toLowerCase() ?? "",
      role: "usuario",
      puedeVerPrecios: false,
      creadoEn: serverTimestamp(),
    });
  }
}

export async function loginWithGoogle() {
  // signInWithPopup on mobile Chrome opens a Custom Chrome Tab (not a real popup),
  // so it is not blocked by the browser. The original error was auth/unauthorized-domain
  // (now fixed). The redirect flow (signInWithRedirect) is unreliable over plain HTTP
  // on Android because indexedDB persistence is restricted, so we always use popup.
  const result = await signInWithPopup(auth, googleProvider);
  await ensureFirestoreUser(result.user);
  return result.user;
}

// Kept as a no-op safety net in case a browser ended up with a pending redirect state
export async function handleGoogleRedirectResult() {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    await ensureFirestoreUser(result.user);
  }
  return result;
}

export function logout() {
  return signOut(auth);
}

export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : "usuario";
}
