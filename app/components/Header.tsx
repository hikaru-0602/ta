"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

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
            href="/work"
            className="block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
          >
            仕事
          </Link>
        </nav>
      </div>
    </header>
  );
}