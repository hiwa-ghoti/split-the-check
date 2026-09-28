import { Suspense } from "react";
import { SessionClient } from "@/components/warikan/session-client";

export default function SessionPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <p className="text-sm text-zinc-500" aria-live="polite">
            読み込み中…
          </p>
        }
      >
        <SessionClient />
      </Suspense>
    </div>
  );
}
