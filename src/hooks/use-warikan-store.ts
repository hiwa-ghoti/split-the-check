"use client";

import { useSyncExternalStore } from "react";
import { createId } from "@/lib/warikan/id";
import { loadSessions, saveSessions } from "@/lib/warikan/storage";
import type { Expense, Member, Session } from "@/types/warikan";

let memorySessions: Session[] | null = null;
const serverSessions: Session[] = [];
const listeners = new Set<() => void>();

function getClientSessions(): Session[] {
  if (memorySessions === null) {
    memorySessions = loadSessions();
  }
  return memorySessions;
}

function getServerSessions(): Session[] {
  return serverSessions;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function commit(next: Session[]): Session[] {
  memorySessions = next;
  saveSessions(next);
  emit();
  return next;
}

export function useWarikanStore() {
  const sessions = useSyncExternalStore(
    subscribe,
    getClientSessions,
    getServerSessions,
  );

  function createSession(): Session {
    const now = new Date();
    const existingSession = getClientSessions().find((session) => {
      const createdAt = new Date(session.createdAt);
      return (
        !Number.isNaN(createdAt.getTime()) &&
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate()
      );
    });

    if (existingSession) return existingSession;

    const session: Session = {
      id: createId("session"),
      title: new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(now),
      createdAt: now.toISOString(),
      members: [],
      expenses: [],
      settledTransferKeys: [],
    };
    commit([session, ...getClientSessions()]);
    return session;
  }

  function deleteSession(sessionId: string) {
    commit(getClientSessions().filter((session) => session.id !== sessionId));
  }

  function updateSession(
    sessionId: string,
    updater: (session: Session) => Session,
  ) {
    commit(
      getClientSessions().map((session) =>
        session.id === sessionId ? updater(session) : session,
      ),
    );
  }

  function renameSession(sessionId: string, title: string) {
    updateSession(sessionId, (session) => ({
      ...session,
      title: title.trim() || session.title,
    }));
  }

  function addMember(sessionId: string, name: string): Member | null {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const member: Member = {
      id: createId("member"),
      name: trimmed,
    };

    updateSession(sessionId, (session) => ({
      ...session,
      members: [...session.members, member],
    }));

    return member;
  }

  function removeMember(sessionId: string, memberId: string) {
    updateSession(sessionId, (session) => ({
      ...session,
      members: session.members.filter((member) => member.id !== memberId),
      expenses: session.expenses
        .filter((expense) => expense.paidById !== memberId)
        .map((expense) => ({
          ...expense,
          participantIds: expense.participantIds.filter((id) => id !== memberId),
        }))
        .filter((expense) => expense.participantIds.length > 0),
    }));
  }

  function addExpense(
    sessionId: string,
    input: {
      title: string;
      amount: number;
      paidById: string;
      participantIds: string[];
    },
  ): Expense | null {
    const title = input.title.trim() || "支払い";
    if (
      !Number.isFinite(input.amount) ||
      input.amount <= 0 ||
      !input.paidById ||
      input.participantIds.length === 0
    ) {
      return null;
    }

    const expense: Expense = {
      id: createId("expense"),
      title,
      amount: Math.round(input.amount),
      paidById: input.paidById,
      participantIds: input.participantIds,
      createdAt: new Date().toISOString(),
    };

    updateSession(sessionId, (session) => ({
      ...session,
      expenses: [expense, ...session.expenses],
    }));

    return expense;
  }

  function removeExpense(sessionId: string, expenseId: string) {
    updateSession(sessionId, (session) => ({
      ...session,
      expenses: session.expenses.filter((expense) => expense.id !== expenseId),
    }));
  }

  function toggleTransferSettled(sessionId: string, transferKey: string) {
    updateSession(sessionId, (session) => {
      const settled = session.settledTransferKeys ?? [];
      return {
        ...session,
        settledTransferKeys: settled.includes(transferKey)
          ? settled.filter((key) => key !== transferKey)
          : [...settled, transferKey],
      };
    });
  }

  function getSession(sessionId: string): Session | undefined {
    return sessions.find((session) => session.id === sessionId);
  }

  return {
    ready: true,
    sessions,
    createSession,
    deleteSession,
    renameSession,
    addMember,
    removeMember,
    addExpense,
    removeExpense,
    toggleTransferSettled,
    getSession,
  };
}
