"use client";

import Header from "../components/Header";
import Setting from "./Setting";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-start justify-center p-8">
        <Setting />
      </div>
    </>
  );
}
