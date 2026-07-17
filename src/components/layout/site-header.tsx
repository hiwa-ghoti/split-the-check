import Link from "next/link";
import { env } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b border-teal-100/80 bg-white/70 backdrop-blur dark:border-teal-950 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-teal-800 dark:text-teal-300">
          {env.NEXT_PUBLIC_APP_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            イベント
          </Link>
        </nav>
      </div>
    </header>
  );
}
