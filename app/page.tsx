"use client";

import Calendar from "./calendar/Calendar";
import Setting from "./setting/Setting";
import { useAuth } from "./firebase/context/auth"; //認証情報を取得
import { login, logout } from "./firebase/lib/auth"; //ログイン・ログアウト関数をインポート
import { useLoginContext } from "./firebase/context/LoginContext";

export default function Home() {
  const user = useAuth();
  const { setIsLoginTriggered } = useLoginContext();

  return (
    <>
      <div className="relative">
        <div className="absolute top-4 right-4">
          {!user ? (
            <button
              onClick={() => {
                login();
                setIsLoginTriggered(true);
              }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm text-size-sm sm:text-base rounded hover:bg-blue-600 transition"
            >
              学内アカウントログイン
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                setIsLoginTriggered(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-size-sm"
            >
              ログアウト
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen p-8 pagemt-16">
          <Calendar />
          <Setting />
        </div>
      </div>
    </>
  );
}
