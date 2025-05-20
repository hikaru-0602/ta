"use client";

import Header from "../components/Header";
import Calendar from "./Calendar";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center p-8">
        <Calendar />
      </div>
    </>
  );
}
