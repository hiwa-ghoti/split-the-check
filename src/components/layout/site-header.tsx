import Link from "next/link";
import { env } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b border-teal-100/80 bg-white/70 backdrop-blur dark:border-teal-950 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-teal-800 dark:text-teal-300">
          {env.NEXT_PUBLIC_APP_NAME}
        </Link>
      </div>
    </header>
  );
}
