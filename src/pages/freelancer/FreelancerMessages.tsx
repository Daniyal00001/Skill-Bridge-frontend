import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";

export default function FreelancerMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(searchParams.get("room"));

  const {
    rooms,
    messages,
    typingUsers,
    isLoadingRooms,
    isLoadingMessages,
    isUploading,
    hasMore,
    loadMore,
    sendMessage,
    sendAttachment,
    startTyping,
    stopTyping,
    muteRoom,
    restrictUser,
    deleteRoom: deleteRoomHook,
    activeRoom,
  } = useChat(activeRoomId || undefined);

  const handleRoomDelete = async (roomId: string) => {
    await deleteRoomHook(roomId);
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  // Auto-select first room if none selected
  if (!activeRoomId && rooms.length > 0 && !isLoadingRooms) {
    setActiveRoomId(rooms[0].id);
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden animate-fade-in">
        {/* ── Sidebar ── */}
        <div className="w-full md:w-72 lg:w-80 border-r flex-shrink-0 hidden md:block">
          <ConversationList
            rooms={rooms}
            activeRoomId={activeRoomId || undefined}
            currentUserId={user?.id ?? ""}
            isLoading={isLoadingRooms}
            onSelect={(room) => setActiveRoomId(room.id)}
          />
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {activeRoom ? (
            <ChatWindow
              room={activeRoom}
              messages={messages}
              currentUserId={user?.id ?? ""}
              currentUserRole={user?.role}
              typingUsers={typingUsers.filter((t) => t.roomId === activeRoom.id)}
              isLoadingMessages={isLoadingMessages}
              isUploading={isUploading}
              hasMore={hasMore}
              onSendMessage={sendMessage}
              onSendAttachment={sendAttachment}
              onLoadMore={loadMore}
              onStartTyping={startTyping}
              onStopTyping={stopTyping}
              onMute={muteRoom}
              onRestrict={restrictUser}
              onDelete={handleRoomDelete}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-30" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No conversation selected</p>
                <p className="text-sm mt-1">Select a conversation to start messaging your clients.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
