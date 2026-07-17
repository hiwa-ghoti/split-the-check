import { SessionClient } from "@/components/warikan/session-client";

type SessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <SessionClient sessionId={id} />
    </div>
  );
}
