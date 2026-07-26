"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { useTripDetail } from "../../../../../hooks/useTripDetail";
import { useChatMessages } from "../../../../../hooks/useChatMessages";
import { useEntries } from "../../../../../hooks/useEntries";
import { TopNav } from "../../../../../components/ui/TopNav";
import { MessageBubble } from "../../../../../components/chat/MessageBubble";
import { ChatComposer } from "../../../../../components/chat/ChatComposer";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareEntryId = searchParams.get("shareEntry");

  const { session } = useAuth();
  const { trip } = useTripDetail(tripId);
  const { messages, sendText, sendMedia, sendSharedEntry, deleteMessage, editMessage } = useChatMessages(tripId);
  const { entries } = useEntries(tripId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const currentUserId = session?.user.id;
  const sharedEntryPreview = shareEntryId ? entries.find((e) => e.id === shareEntryId) ?? null : null;

  function clearShare() {
    router.replace(`/viagens/${tripId}/chat`);
  }

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopNav title={`Chat · ${trip?.title ?? ""}`} onBack={() => router.push(`/viagens/${tripId}`)} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            tripId={tripId}
            canDelete={message.authorId === currentUserId || trip?.role === "owner"}
            canEdit={message.authorId === currentUserId}
            onDelete={() => void deleteMessage(message.id)}
            onEdit={(text) => editMessage(message.id, text)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        onSendText={sendText}
        onSendMedia={sendMedia}
        onSendSharedEntry={sendSharedEntry}
        sharedEntryPreview={sharedEntryPreview}
        onCancelShare={clearShare}
      />
    </div>
  );
}
