"use client";

import Header from "../components/Header";
import Calendar from "./Calendar";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-16">
        <Calendar />
      </div>
    </>
  );
}
