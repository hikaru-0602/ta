"use client";

import Header from "./components/Header";
import Calendar from "./calendar/Calendar";
import Setting from "./setting/Setting";

export default function Home() {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen p-8 gap-8 mt-10">
        <Calendar />
        <Setting />
      </div>
    </>
  );
}
