import assert from "node:assert/strict";
import test from "node:test";

import { calculateSettlement, splitAmount } from "./calculate.ts";
import type { Expense, Member, Session } from "../../types/warikan.ts";

const members: Member[] = [
  { id: "a", name: "A" },
  { id: "b", name: "B" },
  { id: "c", name: "C" },
];

function session(expenses: Expense[], sessionMembers = members): Session {
  return {
    id: "session",
    title: "test",
    createdAt: "2026-01-01T00:00:00.000Z",
    members: sessionMembers,
    expenses,
  };
}

function expense(
  amount: number,
  paidById = "a",
  participantIds = ["a", "b", "c"],
  id = "expense",
): Expense {
  return {
    id,
    title: id,
    amount,
    paidById,
    participantIds,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function assertBalanced(result: ReturnType<typeof calculateSettlement>) {
  assert.equal(
    result.balances.reduce((sum, balance) => sum + balance.paid, 0),
    result.totalAmount,
    "支払額の合計が総額と一致する",
  );
  assert.equal(
    result.balances.reduce((sum, balance) => sum + balance.share, 0),
    result.totalAmount,
    "負担額の合計が総額と一致する",
  );
  assert.equal(
    result.balances.reduce((sum, balance) => sum + balance.net, 0),
    0,
    "全員の収支合計が0になる",
  );

  const remaining = new Map(
    result.balances.map((balance) => [balance.memberId, balance.net]),
  );
  for (const transfer of result.transfers) {
    assert.ok(transfer.amount > 0, "送金額は正数になる");
    remaining.set(
      transfer.fromId,
      (remaining.get(transfer.fromId) ?? 0) + transfer.amount,
    );
    remaining.set(
      transfer.toId,
      (remaining.get(transfer.toId) ?? 0) - transfer.amount,
    );
  }
  assert.deepEqual([...remaining.values()], result.balances.map(() => 0));
}

test("splitAmount: 均等割り", () => {
  assert.deepEqual(splitAmount(1200, 3), [400, 400, 400]);
});

test("splitAmount: 端数は先頭から1円ずつ配る", () => {
  assert.deepEqual(splitAmount(10, 3), [4, 3, 3]);
  assert.deepEqual(splitAmount(2, 4), [1, 1, 0, 0]);
});

test("splitAmount: 1人・0人・負の人数", () => {
  assert.deepEqual(splitAmount(99, 1), [99]);
  assert.deepEqual(splitAmount(99, 0), []);
  assert.deepEqual(splitAmount(99, -1), []);
});

test("calculateSettlement: メンバーや支払いがなくても空の精算結果になる", () => {
  assert.deepEqual(calculateSettlement(session([], [])), {
    totalAmount: 0,
    balances: [],
    transfers: [],
  });

  const result = calculateSettlement(session([]));
  assert.equal(result.totalAmount, 0);
  assert.deepEqual(result.balances.map((balance) => balance.net), [0, 0, 0]);
  assert.deepEqual(result.transfers, []);
});

test("calculateSettlement: 3000円を3人で均等に精算", () => {
  const result = calculateSettlement(session([expense(3000)]));
  assert.deepEqual(
    result.balances.map(({ paid, share, net }) => ({ paid, share, net })),
    [
      { paid: 3000, share: 1000, net: 2000 },
      { paid: 0, share: 1000, net: -1000 },
      { paid: 0, share: 1000, net: -1000 },
    ],
  );
  assert.deepEqual(
    result.transfers.map(({ fromId, toId, amount }) => ({ fromId, toId, amount })),
    [
      { fromId: "b", toId: "a", amount: 1000 },
      { fromId: "c", toId: "a", amount: 1000 },
    ],
  );
  assertBalanced(result);
});

test("calculateSettlement: 端数を含む10円を3人で精算", () => {
  const result = calculateSettlement(session([expense(10)]));
  assert.deepEqual(result.balances.map((balance) => balance.share), [4, 3, 3]);
  assertBalanced(result);
});

test("calculateSettlement: 支払者が割り勘対象外でも精算できる", () => {
  const result = calculateSettlement(session([expense(100, "a", ["b", "c"])]));
  assert.deepEqual(result.balances.map((balance) => balance.net), [100, -50, -50]);
  assertBalanced(result);
});

test("calculateSettlement: 同じ二人の支払いを相殺してまとめる", () => {
  const result = calculateSettlement(
    session([
      expense(120, "a", ["a", "b", "c"], "first"),
      expense(60, "b", ["a", "b"], "second"),
      expense(50, "c", ["b", "c"], "third"),
    ]),
  );
  assert.equal(result.totalAmount, 230);
  assert.deepEqual(result.balances.map((balance) => balance.net), [50, -35, -15]);
  assert.deepEqual(
    result.transfers.map(({ fromId, toId, amount }) => ({ fromId, toId, amount })),
    [
      { fromId: "b", toId: "a", amount: 10 },
      { fromId: "c", toId: "a", amount: 40 },
      { fromId: "b", toId: "c", amount: 25 },
    ],
  );
  assertBalanced(result);
});

test("calculateSettlement: Aが9000円、Bが1200円を3人分払い、Cは両者へ個別に払う", () => {
  const result = calculateSettlement(
    session([
      expense(9000, "a", ["a", "b", "c"], "paid-by-a"),
      expense(1200, "b", ["a", "b", "c"], "paid-by-b"),
    ]),
  );

  assert.equal(result.totalAmount, 10200);
  assert.deepEqual(
    result.balances.map(({ memberId, paid, share, net }) => ({
      memberId,
      paid,
      share,
      net,
    })),
    [
      { memberId: "a", paid: 9000, share: 3400, net: 5600 },
      { memberId: "b", paid: 1200, share: 3400, net: -2200 },
      { memberId: "c", paid: 0, share: 3400, net: -3400 },
    ],
  );
  assert.deepEqual(
    result.transfers.map(({ fromId, toId, amount }) => ({
      fromId,
      toId,
      amount,
    })),
    [
      { fromId: "b", toId: "a", amount: 2600 },
      { fromId: "c", toId: "a", amount: 3000 },
      { fromId: "c", toId: "b", amount: 400 },
    ],
  );
  assertBalanced(result);
});

test("calculateSettlement: A→B 300円とB→A 3000円をB→A 2700円にまとめる", () => {
  const result = calculateSettlement(
    session(
      [
        expense(600, "b", ["a", "b"], "paid-by-b"),
        expense(6000, "a", ["a", "b"], "paid-by-a"),
      ],
      members.slice(0, 2),
    ),
  );

  assert.deepEqual(
    result.transfers.map(({ fromId, toId, amount }) => ({ fromId, toId, amount })),
    [{ fromId: "b", toId: "a", amount: 2700 }],
  );
  assertBalanced(result);
});

test("calculateSettlement: 自分だけの支払いは送金不要", () => {
  const result = calculateSettlement(session([expense(500, "a", ["a"])]));
  assert.deepEqual(result.balances.map((balance) => balance.net), [0, 0, 0]);
  assert.deepEqual(result.transfers, []);
  assertBalanced(result);
});

test("calculateSettlement: 0円・負数・参加者なし・不明な支払者を無視", () => {
  const result = calculateSettlement(
    session([
      expense(0, "a", ["a"], "zero"),
      expense(-10, "a", ["a"], "negative"),
      expense(10, "a", [], "nobody"),
      expense(10, "missing", ["a"], "missing-payer"),
    ]),
  );
  assert.equal(result.totalAmount, 0);
  assertBalanced(result);
});

test("calculateSettlement: 不明な参加者を除外する", () => {
  const result = calculateSettlement(
    session([expense(100, "a", ["a", "missing"])]),
  );
  assert.deepEqual(result.balances.map((balance) => balance.share), [100, 0, 0]);
  assertBalanced(result);
});

test("calculateSettlement: 重複した参加者IDを二重計上しない", () => {
  const result = calculateSettlement(session([expense(100, "a", ["a", "b", "b"])]));
  assert.deepEqual(result.balances.map((balance) => balance.share), [50, 50, 0]);
  assertBalanced(result);
});

test("calculateSettlement: 小数・NaN・Infinityは不正な円金額として無視", () => {
  const result = calculateSettlement(
    session([
      expense(10.5, "a", ["a", "b"], "decimal"),
      expense(Number.NaN, "a", ["a", "b"], "nan"),
      expense(Number.POSITIVE_INFINITY, "a", ["a", "b"], "infinity"),
    ]),
  );
  assert.equal(result.totalAmount, 0);
  assertBalanced(result);
});

test("calculateSettlement: 500通りのランダムな正常データで不変条件を保つ", () => {
  let seed = 0x12345678;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };

  for (let caseIndex = 0; caseIndex < 500; caseIndex += 1) {
    const count = 1 + Math.floor(random() * 8);
    const randomMembers = Array.from({ length: count }, (_, index) => ({
      id: `m${index}`,
      name: `M${index}`,
    }));
    const expenseCount = Math.floor(random() * 30);
    const expenses = Array.from({ length: expenseCount }, (_, index) => {
      const participants = randomMembers
        .filter(() => random() < 0.6)
        .map((member) => member.id);
      if (participants.length === 0) {
        participants.push(randomMembers[Math.floor(random() * count)]!.id);
      }
      return expense(
        1 + Math.floor(random() * 1_000_000),
        randomMembers[Math.floor(random() * count)]!.id,
        participants,
        `random-${caseIndex}-${index}`,
      );
    });

    assertBalanced(calculateSettlement(session(expenses, randomMembers)));
  }
});
