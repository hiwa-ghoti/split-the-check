import Link from "next/link";
import { env } from "@/lib/env";

export function SiteHeader() {
  return (
    <header className="border-b-[1px] border-[#efefef] bg-background">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-blue-800 dark:text-blue-300">
          {env.NEXT_PUBLIC_APP_NAME}
        </Link>
      </div>
    </header>
  );
}
