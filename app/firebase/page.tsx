"use client";
import { useAuth } from "./context/auth";
import { login, logout } from "./lib/auth";
import { useState } from "react";

export default function Home() {
  const user = useAuth();
  const [waiting, setWaiting] = useState<boolean>(false);

  const signIn = () => {
    setWaiting(true);

    login()
      .then((userCredential) => {
        console.log(userCredential);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        console.log("finally");
        setWaiting(false);
      });
  };
  return (
    <div>
      <h1>こんにちは</h1>
      {user === null && !waiting && (
        <button
          onClick={() => {
            signIn();
          }}
        >
          ログイン
        </button>
      )}
      {user && (
        <button
          onClick={() => {
            logout();
          }}
        >
          ログアウト
        </button>
      )}
    </div>
  );
}
