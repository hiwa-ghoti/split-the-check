"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { SessionDetail } from "@/components/warikan/session-detail";
import { useWarikanStore } from "@/hooks/use-warikan-store";

type SessionClientProps = {
  sessionId: string;
};

function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SessionClient({ sessionId }: SessionClientProps) {
  const hydrated = useHasHydrated();
  const store = useWarikanStore();
  const session = store.getSession(sessionId);

  if (!hydrated) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        読み込み中…
      </p>
    );
  }

  if (!session) {
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
