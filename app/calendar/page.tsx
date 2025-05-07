"use client";

import { useEffect, useState } from "react";
import Header from "../components/header";
import Calendar from "./Calendar";

export default function Home() {
  const [workData, setWorkData] = useState<any[]>([]);

  useEffect(() => {
    // クライアントサイドでのみ localStorage を使用
    const savedWorkData = localStorage.getItem("workData");
    const parsedWorkData = savedWorkData ? JSON.parse(savedWorkData) : [];
    setWorkData(parsedWorkData);

    // 初期化が必要な場合
    if (!savedWorkData) {
      localStorage.setItem("workData", JSON.stringify(parsedWorkData));
    }
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-16">
        <Calendar />
      </div>
    </>
  );
}
