import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser]       = useState(undefined);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = () => auth ? signInWithPopup(auth, provider) : Promise.reject(new Error("Firebase no configurado"));
  const logout = () => auth ? signOut(auth) : Promise.resolve();

  return { user, loading, loginWithGoogle, logout };
}
