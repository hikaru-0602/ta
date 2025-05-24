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

type UserContextType = boolean | undefined;

const AuthContext = createContext<UserContextType>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserContextType>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, `users/${firebaseUser.uid}`);
        const snap = await getDoc(ref);
        //console.log("firebaseUser", firebaseUser);
        if (snap.exists()) {
          //const appUser = (await getDoc(ref)).data() as User;
          setUser(true);
        } else {
          await setDoc(ref, {}); // 空ドキュメントを作成
          setUser(true); // 必要に応じてnullやundefinedをセット
        }
      } else {
        setUser(false);
      }
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
