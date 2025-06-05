"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WorkData } from "../types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

type WorkContextType = {
  workData: WorkData[];
  setWorkData: React.Dispatch<React.SetStateAction<WorkData[]>>;
  refreshWorkData: () => void;
};

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workData, setWorkData] = useState<WorkData[]>([]);

  // 認証状態を監視してからFirestoreからリアルタイムでデータを取得
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合のみデータ監視を開始
        const unsubscribeSnapshot = onSnapshot(
          collection(db, `users/${user.uid}/works`),
          (snapshot) => {
            const works = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: Number(doc.data().id) || Number(doc.id)
            })) as WorkData[];
            setWorkData(works);
          },
          (error) => {
            console.error("WorkContext: 業務データの監視エラー:", error);
          }
        );

        // 認証状態が変更されたときにFirestore監視を停止
        return unsubscribeSnapshot;
      } else {
        // ログアウト時は初期状態に戻す
        setWorkData([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 既存コードとの互換性のため関数は残すが、リアルタイム監視により自動更新される
  const refreshWorkData = () => {
    // リアルタイム監視により自動で最新データが取得されるため、何もしない
    // 既存コードとの互換性のため関数は残す
  };

  return (
    <WorkContext.Provider value={{ workData, setWorkData, refreshWorkData }}>
      {children}
    </WorkContext.Provider>
  );
};

export const useWorkContext = () => {
  const context = useContext(WorkContext);
  if (context === undefined) {
    throw new Error("useWorkContext must be used within a WorkProvider");
  }
  return context;
};
