"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { SessionDetail } from "@/components/warikan/session-detail";
import { useWarikanStore } from "@/hooks/use-warikan-store";

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SessionClient() {
  const sessionId = useSearchParams().get("id");
  const hydrated = useHasHydrated();
  const store = useWarikanStore();
  const session = sessionId ? store.getSession(sessionId) : undefined;

  if (!hydrated) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        読み込み中…
      </p>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          イベントが見つかりません。削除されたか、別のブラウザのデータかもしれません。
        </p>
        <Link
          href="/"
          className="inline-flex text-sm text-teal-700 hover:underline dark:text-teal-400"
        >
          ← イベント一覧へ
        </Link>
      </div>
    );
  }

  return (
    <SessionDetail
      session={session}
      onRename={(title) => store.renameSession(sessionId, title)}
      onAddMember={(name) => store.addMember(sessionId, name)}
      onRemoveMember={(memberId) => store.removeMember(sessionId, memberId)}
      onAddExpense={(input) => store.addExpense(sessionId, input)}
      onRemoveExpense={(expenseId) => store.removeExpense(sessionId, expenseId)}
    />
  );
}
