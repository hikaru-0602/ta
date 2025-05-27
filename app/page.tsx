"use client";

import Calendar from "./calendar/Calendar";
import Setting from "./setting/Setting";
import { useAuth } from "./firebase/context/auth";
import { login, logout } from "./firebase/lib/auth";
import { useLoginContext } from "./firebase/context/LoginContext";

export default function Home() {
  const user = useAuth();
  const { setIsLoginTriggered } = useLoginContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="py-5 flex justify-end pr-8">
        {!user ? (
          <button
            onClick={() => {
              login();
              setIsLoginTriggered(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            学内アカウントログイン
          </button>
        ) : (
          <button
            onClick={() => {
              logout();
              setIsLoginTriggered(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 px-8">
        <Calendar />
        <Setting />
      </div>
    </div>
  );
}
