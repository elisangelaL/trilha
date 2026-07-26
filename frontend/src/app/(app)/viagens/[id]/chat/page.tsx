"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { useTripDetail } from "../../../../../hooks/useTripDetail";
import { useChatMessages } from "../../../../../hooks/useChatMessages";
import { TopNav } from "../../../../../components/ui/TopNav";
import { MessageBubble } from "../../../../../components/chat/MessageBubble";
import { ChatComposer } from "../../../../../components/chat/ChatComposer";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const router = useRouter();

  const { session } = useAuth();
  const { trip } = useTripDetail(tripId);
  const { messages, sendText, sendMedia, deleteMessage, editMessage } = useChatMessages(tripId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const currentUserId = session?.user.id;

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopNav title={`Chat · ${trip?.title ?? ""}`} onBack={() => router.push(`/viagens/${tripId}`)} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            canDelete={message.authorId === currentUserId || trip?.role === "owner"}
            canEdit={message.authorId === currentUserId}
            onDelete={() => void deleteMessage(message.id)}
            onEdit={(text) => editMessage(message.id, text)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatComposer onSendText={sendText} onSendMedia={sendMedia} />
    </div>
  );
}
