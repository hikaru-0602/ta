"use client";

import Header from "./components/Header";
import Page from "./calendar/page";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 mt-16">
        <Page />
      </div>
    </>
  );
}
