import { TopBar } from "@/components/top-bar";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata = {
  title: "Chat",
  description: "Chat with conference attendees.",
};

export default async function Layout({ children, inbox }) {
  await connection();
  return (
    <>
      <div className="absolute bottom-0 right-0 flex h-[calc(100%-65px)] w-full grow flex-row overflow-hidden md:flex lg:bg-white lg:p-0 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        <div className="hidden md:block">
          <Suspense fallback={<div>Loading...</div>}>{inbox}</Suspense>
        </div>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </>
  );
}
