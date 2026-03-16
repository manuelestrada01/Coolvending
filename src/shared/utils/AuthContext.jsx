import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebase";
import { handleGoogleRedirectResult } from "../../services/firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [puedeVerPrecios, setPuedeVerPrecios] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState(null);

  useEffect(() => {
    // Consume any leftover redirect state from previous sessions (safety net)
    handleGoogleRedirectResult().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const data = snap.exists() ? snap.data() : {};
        setRole(data.role ?? "usuario");
        setPuedeVerPrecios(data.puedeVerPrecios === true);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
        setPuedeVerPrecios(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, loading, isAdmin: role === "admin", puedeVerPrecios, redirectError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
