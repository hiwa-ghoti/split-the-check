"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatYen } from "@/lib/warikan/format";
import { calculateSettlement } from "@/lib/warikan/calculate";
import type { Session } from "@/types/warikan";

type SessionListProps = {
  sessions: Session[];
  onCreate: (title: string) => Session;
  onDelete: (sessionId: string) => void;
};

export function SessionList({ sessions, onCreate, onDelete }: SessionListProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = onCreate(title);
    setTitle("");
    router.push(`/sessions/${session.id}`);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-teal-200/70 bg-white/80 p-5 shadow-sm dark:border-teal-900/50 dark:bg-zinc-950/60">
        <h2 className="text-sm font-semibold tracking-tight">新しいイベント</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          飲み会や旅行など、割り勘したい集まりを作ってください。
        </p>
        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例: 7/17 飲み会"
            aria-label="イベント名"
          />
          <Button type="submit" className="shrink-0 sm:w-auto">
            作成する
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
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => router.push(`/sessions/${session.id}`)}
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
                      onClick={() => router.push(`/sessions/${session.id}`)}
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
