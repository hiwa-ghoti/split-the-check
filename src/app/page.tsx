import Link from "next/link";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

const primaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

const secondaryLinkClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-transparent px-4 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium tracking-wide text-zinc-500">Starter</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {env.NEXT_PUBLIC_APP_NAME}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Next.js（App Router）+ TypeScript + Tailwind
        の実用スターターです。ここからドメイン機能を足していきます。
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/api/health" className={cn(primaryLinkClass)}>
          Health API を確認
        </Link>
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(secondaryLinkClass)}
        >
          Next.js Docs
        </a>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold tracking-tight">次にやること</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <li>
            <code className="text-zinc-800 dark:text-zinc-200">src/types/</code>{" "}
            にドメイン型を追加する
          </li>
          <li>
            <code className="text-zinc-800 dark:text-zinc-200">src/lib/</code>{" "}
            にロジック・データ取得を置く
          </li>
          <li>
            <code className="text-zinc-800 dark:text-zinc-200">src/app/</code> に
            ページや API Route を追加する
          </li>
          <li>
            UI は{" "}
            <code className="text-zinc-800 dark:text-zinc-200">
              src/components/
            </code>{" "}
            に分ける（汎用は <code>ui/</code>、ドメイン固有は専用フォルダ）
          </li>
        </ol>
      </section>
    </div>
  );
}
