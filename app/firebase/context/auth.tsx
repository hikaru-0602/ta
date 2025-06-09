"use client";

import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthState = {
  user: boolean | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, isLoading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, `users/${firebaseUser.uid}`);
        const snap = await getDoc(ref);
        //console.log("firebaseUser", firebaseUser);
        if (snap.exists()) {
          //const appUser = (await getDoc(ref)).data() as User;
          setAuthState({ user: true, isLoading: false });
        } else {
          await setDoc(ref, {}); // 空ドキュメントを作成
          setAuthState({ user: true, isLoading: false }); // 必要に応じてnullやundefinedをセット
        }
      } else {
        setAuthState({ user: false, isLoading: false });
      }
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
