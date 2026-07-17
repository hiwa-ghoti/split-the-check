import { HomeClient } from "@/components/warikan/home-client";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium tracking-wide text-teal-700 dark:text-teal-400">
          わりかん
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          誰が何を払ったかを残して、あとでスッキリ精算
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          友達との飲み会や旅行で「結局だれがいくら？」とならないよう、支払いを記録して送金先を自動で出します。データはこの端末に保存されます。
        </p>
      </header>

      <HomeClient />
    </div>
  );
}
