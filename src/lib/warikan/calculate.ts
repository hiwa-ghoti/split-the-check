import type {
  Member,
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

  for (const member of session.members) {
    paid.set(member.id, 0);
    share.set(member.id, 0);
  }

  let totalAmount = 0;

  for (const expense of session.expenses) {
    if (expense.amount <= 0 || expense.participantIds.length === 0) continue;
    if (!paid.has(expense.paidById)) continue;

    const participants = expense.participantIds.filter((id) => share.has(id));
    if (participants.length === 0) continue;

    totalAmount += expense.amount;
    paid.set(expense.paidById, (paid.get(expense.paidById) ?? 0) + expense.amount);

    const parts = splitAmount(expense.amount, participants.length);
    participants.forEach((id, index) => {
      share.set(id, (share.get(id) ?? 0) + parts[index]!);
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

  return {
    totalAmount,
    balances,
    transfers: buildTransfers(balances, session.members),
  };
}

function buildTransfers(
  balances: MemberBalance[],
  members: Member[],
): Transfer[] {
  const nameById = new Map(members.map((member) => [member.id, member.name]));

  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ id: b.memberId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ id: b.memberId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]!;
    const creditor = creditors[j]!;
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      transfers.push({
        fromId: debtor.id,
        fromName: nameById.get(debtor.id) ?? debtor.id,
        toId: creditor.id,
        toName: nameById.get(creditor.id) ?? creditor.id,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i += 1;
    if (creditor.amount === 0) j += 1;
  }

  return transfers;
}
