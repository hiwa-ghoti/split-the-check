"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateSettlement } from "@/lib/warikan/calculate";
import { formatYen } from "@/lib/warikan/format";
import { cn } from "@/lib/utils";
import type { Member, Session } from "@/types/warikan";

type SessionDetailProps = {
  session: Session;
  onRename: (title: string) => void;
  onAddMember: (name: string) => void;
  onRemoveMember: (memberId: string) => void;
  onAddExpense: (input: {
    title: string;
    amount: number;
    paidById: string;
    participantIds: string[];
  }) => void;
  onRemoveExpense: (expenseId: string) => void;
};

export function SessionDetail({
  session,
  onRename,
  onAddMember,
  onRemoveMember,
  onAddExpense,
  onRemoveExpense,
}: SessionDetailProps) {
  const settlement = useMemo(() => calculateSettlement(session), [session]);
  const [memberName, setMemberName] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(session.title);

  const memberNameById = useMemo(
    () => new Map(session.members.map((member) => [member.id, member.name])),
    [session.members],
  );

  const membersKey = session.members.map((member) => member.id).join(",");

  function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddMember(memberName);
    setMemberName("");
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-teal-700 hover:underline dark:text-teal-400"
        >
          ← イベント一覧
        </Link>

        {editingTitle ? (
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onRename(titleDraft);
              setEditingTitle(false);
            }}
          >
            <Input
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              aria-label="イベント名"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                保存
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTitleDraft(session.title);
                  setEditingTitle(false);
                }}
              >
                キャンセル
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {session.title}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                合計 {formatYen(settlement.totalAmount)} · 支払い{" "}
                {session.expenses.length}件
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingTitle(true)}
            >
              名前を変更
            </Button>
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
        <h2 className="text-sm font-semibold tracking-tight">メンバー</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          割り勘に参加する人を追加します。
        </p>

        <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
          <Input
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="名前"
            aria-label="メンバー名"
          />
          <Button type="submit" className="shrink-0">
            追加
          </Button>
        </form>

        {session.members.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">まだメンバーがいません。</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {session.members.map((member) => (
              <li
                key={member.id}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <span>{member.name}</span>
                <button
                  type="button"
                  className="text-zinc-400 hover:text-red-600"
                  aria-label={`${member.name}を削除`}
                  onClick={() => onRemoveMember(member.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
        <h2 className="text-sm font-semibold tracking-tight">支払いを記録</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          誰が何を払ったかを残すと、あとで精算できます。
        </p>

        {session.members.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            先にメンバーを追加してください。
          </p>
        ) : (
          <ExpenseForm
            key={membersKey}
            members={session.members}
            onAddExpense={onAddExpense}
          />
        )}

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            支払い履歴
          </h3>
          {session.expenses.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">まだ支払いがありません。</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
              {session.expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{expense.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {memberNameById.get(expense.paidById) ?? "不明"}が支払い ·
                      対象{" "}
                      {expense.participantIds
                        .map((id) => memberNameById.get(id) ?? "?")
                        .join("、")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-medium tabular-nums">
                      {formatYen(expense.amount)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveExpense(expense.id)}
                    >
                      削除
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-white p-5 dark:border-teal-900/60 dark:from-teal-950/40 dark:to-zinc-950">
        <h2 className="text-sm font-semibold tracking-tight">精算結果</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          支払いごとに、誰が支払者へいくら渡すかをまとめます。
        </p>

        {session.members.length === 0 || session.expenses.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            メンバーと支払いを追加すると、ここに精算が表示されます。
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                各人の収支
              </h3>
              <ul className="mt-2 space-y-2">
                {settlement.balances.map((balance) => (
                  <li
                    key={balance.memberId}
                    className="flex flex-col gap-1 rounded-lg bg-white/70 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-950/50"
                  >
                    <span className="font-medium">{balance.name}</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      支払済 {formatYen(balance.paid)} / 負担{" "}
                      {formatYen(balance.share)}
                      <span
                        className={cn(
                          "ml-2 font-medium tabular-nums",
                          balance.net > 0 && "text-teal-700 dark:text-teal-400",
                          balance.net < 0 && "text-amber-700 dark:text-amber-400",
                          balance.net === 0 && "text-zinc-500",
                        )}
                      >
                        {balance.net > 0
                          ? `+${formatYen(balance.net)}`
                          : formatYen(balance.net)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                送金メモ（支払いごと）
              </h3>
              {settlement.transfers.length === 0 ? (
                <p className="mt-2 text-sm text-teal-800 dark:text-teal-300">
                  すでに清算済みです。追加の送金は不要です。
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {settlement.transfers.map((transfer) => (
                    <li
                      key={`${transfer.expenseId}-${transfer.fromId}-${transfer.toId}`}
                      className="rounded-lg bg-white/80 px-3 py-3 text-sm dark:bg-zinc-950/60"
                    >
                      <p className="mb-1 text-xs text-zinc-500">
                        {transfer.expenseTitle}の精算
                      </p>
                      <p>
                        <span className="font-medium">{transfer.fromName}</span>
                        <span className="mx-2 text-zinc-400">→</span>
                        <span className="font-medium">{transfer.toName}</span>
                        <span className="ml-2 font-semibold tabular-nums text-teal-800 dark:text-teal-300">
                          {formatYen(transfer.amount)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

type ExpenseFormProps = {
  members: Member[];
  onAddExpense: (input: {
    title: string;
    amount: number;
    paidById: string;
    participantIds: string[];
  }) => void;
};

function ExpenseForm({ members, onAddExpense }: ExpenseFormProps) {
  const [expenseTitle, setExpenseTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState(members[0]?.id ?? "");
  const [participantIds, setParticipantIds] = useState(
    members.map((member) => member.id),
  );

  function handleAddExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(/,/g, ""));
    onAddExpense({
      title: expenseTitle,
      amount: parsedAmount,
      paidById,
      participantIds,
    });
    setExpenseTitle("");
    setAmount("");
  }

  function toggleParticipant(memberId: string) {
    setParticipantIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  return (
    <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">内容</span>
          <Input
            value={expenseTitle}
            onChange={(event) => setExpenseTitle(event.target.value)}
            placeholder="例: 居酒屋、タクシー"
          />
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">金額（円）</span>
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="3000"
            required
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">支払った人</span>
        <select
          className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-950"
          value={paidById}
          onChange={(event) => setPaidById(event.target.value)}
          required
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-sm text-zinc-600 dark:text-zinc-400">
          割り勘する人
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {members.map((member) => {
            const checked = participantIds.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleParticipant(member.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  checked
                    ? "border-teal-600 bg-teal-50 text-teal-900 dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-100"
                    : "border-zinc-300 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900",
                )}
              >
                {member.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        disabled={!paidById || participantIds.length === 0 || !amount}
      >
        支払いを追加
      </Button>
    </form>
  );
}
