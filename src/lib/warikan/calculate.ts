import type {
  MemberBalance,
  Session,
  Settlement,
  Transfer,
} from "@/types/warikan";

/**
 * Split amount across n people so the sum stays exact (yen integers).
 * Remainder yen go to the first participants.
 */
export function splitAmount(amount: number, participantCount: number): number[] {
  if (participantCount <= 0) return [];
  const base = Math.floor(amount / participantCount);
  const remainder = amount - base * participantCount;
  return Array.from({ length: participantCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

export function calculateSettlement(session: Session): Settlement {
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  const nameById = new Map(session.members.map((member) => [member.id, member.name]));
  const transferAmounts = new Map<string, number>();

  for (const member of session.members) {
    paid.set(member.id, 0);
    share.set(member.id, 0);
  }

  let totalAmount = 0;

  for (const expense of session.expenses) {
    if (!Number.isSafeInteger(expense.amount) || expense.amount <= 0) continue;
    if (expense.participantIds.length === 0) continue;
    if (!paid.has(expense.paidById)) continue;

    const participants = [
      ...new Set(expense.participantIds.filter((id) => share.has(id))),
    ];
    if (participants.length === 0) continue;

    totalAmount += expense.amount;
    paid.set(expense.paidById, (paid.get(expense.paidById) ?? 0) + expense.amount);

    const parts = splitAmount(expense.amount, participants.length);
    participants.forEach((id, index) => {
      const amount = parts[index]!;
      share.set(id, (share.get(id) ?? 0) + amount);

      if (id !== expense.paidById && amount > 0) {
        const [firstId, secondId] = [id, expense.paidById].sort();
        const pairKey = `${firstId}\u0000${secondId}`;
        const signedAmount = id === firstId ? amount : -amount;
        transferAmounts.set(
          pairKey,
          (transferAmounts.get(pairKey) ?? 0) + signedAmount,
        );
      }
    });
  }

  const balances: MemberBalance[] = session.members.map((member) => {
    const paidAmount = paid.get(member.id) ?? 0;
    const shareAmount = share.get(member.id) ?? 0;
    return {
      memberId: member.id,
      name: member.name,
      paid: paidAmount,
      share: shareAmount,
      net: paidAmount - shareAmount,
    };
  });

  const transfers: Transfer[] = [];
  for (const [pairKey, signedAmount] of transferAmounts) {
    if (signedAmount === 0) continue;
    const [firstId, secondId] = pairKey.split("\u0000");
    const fromId = signedAmount > 0 ? firstId! : secondId!;
    const toId = signedAmount > 0 ? secondId! : firstId!;
    transfers.push({
      fromId,
      fromName: nameById.get(fromId) ?? fromId,
      toId,
      toName: nameById.get(toId) ?? toId,
      amount: Math.abs(signedAmount),
    });
  }

  return {
    totalAmount,
    balances,
    transfers,
  };
}

export function getTransferKey(transfer: Transfer): string {
  return `${transfer.fromId}:${transfer.toId}:${transfer.amount}`;
}
