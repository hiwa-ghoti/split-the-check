"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate, formatYen } from "@/lib/warikan/format";
import { calculateSettlement } from "@/lib/warikan/calculate";
import type { Session } from "@/types/warikan";

type SessionListProps = {
  sessions: Session[];
  onCreate: () => Session;
  onDelete: (sessionId: string) => void;
};

export function SessionList({ sessions, onCreate, onDelete }: SessionListProps) {
  const router = useRouter();
  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = onCreate();
    router.push(`/sessions?id=${encodeURIComponent(session.id)}`);
  }

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border-2 border-[#dbe7ff] bg-[#eef4ff]/70 p-5 dark:border-blue-950 dark:bg-zinc-950/60">
        <h2 className="text-sm font-semibold tracking-tight">新しいイベント</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          今日の支払いを記録するイベントを開きます。
        </p>
        <form onSubmit={handleCreate} className="mt-4">
          <Button type="submit">
            今日のイベントを開く
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-tight">イベント一覧</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            まだイベントがありません。上から作成してみましょう。
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sessions.map((session) => {
              const settlement = calculateSettlement(session);
              return (
                <li
                  key={session.id}
                  className="flex flex-col gap-3 rounded-xl border-2 border-[#e5edff] bg-white/65 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      router.push(`/sessions?id=${encodeURIComponent(session.id)}`)
                    }
                  >
                    <p className="truncate font-medium tracking-tight">
                      {session.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formatDate(session.createdAt)} · メンバー{" "}
                      {session.members.length}人 · 合計{" "}
                      {formatYen(settlement.totalAmount)}
                    </p>
                  </button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        router.push(`/sessions?id=${encodeURIComponent(session.id)}`)
                      }
                    >
                      開く
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`「${session.title}」を削除しますか？`)) {
                          onDelete(session.id);
                        }
                      }}
                    >
                      削除
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
