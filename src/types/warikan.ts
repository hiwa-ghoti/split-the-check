export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  participantIds: string[];
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  members: Member[];
  expenses: Expense[];
}

export interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  share: number;
  net: number;
}

export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export interface Settlement {
  totalAmount: number;
  balances: MemberBalance[];
  transfers: Transfer[];
}
