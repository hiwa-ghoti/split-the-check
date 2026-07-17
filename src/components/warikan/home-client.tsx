"use client";

import { SessionList } from "@/components/warikan/session-list";
import { useWarikanStore } from "@/hooks/use-warikan-store";

export function HomeClient() {
  const { sessions, createSession, deleteSession } = useWarikanStore();

  return (
    <SessionList
      sessions={sessions}
      onCreate={createSession}
      onDelete={deleteSession}
    />
  );
}
