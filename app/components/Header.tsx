"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../firebase/context/auth"; // 認証情報を取得
import { login, logout } from "../firebase/lib/auth"; // ログイン・ログアウト関数をインポート

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuth(); // 現在のユーザー情報を取得

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-black shadow-md z-50">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold">勤務表アプリ</h1>
        <button
          className="sm:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-black dark:bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-black dark:bg-white"></div>
        </button>
        <nav
          className={`${
            isOpen ? "block" : "hidden"
          } sm:flex sm:items-center sm:gap-4`}
        >
          <Link
            href="/"
            className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            勤務表
          </Link>
          <Link
            href="/setting"
            className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            仕事
          </Link>
        </nav>
        {/* ログイン・ログアウトボタン */}
        <div className="ml-4">
          {user === null ? (
            <button
              onClick={login}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded hover:bg-blue-600 transition"
            >
              学内アカウントログイン
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
