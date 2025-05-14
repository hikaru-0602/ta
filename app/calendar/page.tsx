"use client";

import Header from "../components/Header";
import Calendar from "./Calendar";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl font-bold text-center mt-20">
          パソコンでの利用がおすすめ
        </h1>
        <Calendar />
      </div>
    </>
  );
}
