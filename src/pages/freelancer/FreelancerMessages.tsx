import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatUI } from "@/components/client/ChatUI";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreVertical, Settings } from "lucide-react";
import { mockConversations, mockUsers, Message } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function FreelancerMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState(
    mockConversations[0].id,
  );
  const [messages, setMessages] = useState<Message[]>(
    mockConversations[0].lastMessage ? [mockConversations[0].lastMessage] : [],
  );

  const selectedConversation = mockConversations.find(
    (c) => c.id === selectedConversationId,
  );

  // Identify the "other" participant (Client)
  const otherUser =
    selectedConversation?.participants.find((p) => p.id !== "user-2") ||
    mockUsers[0]; // fallback
  const currentUser = mockUsers.find((u) => u.id === "user-2")!; // Mock developer

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-10rem)] flex gap-8 animate-fade-in">
        {/* Sidebar List */}
        <div className="w-96 flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Messages</h2>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary font-black px-2 py-0.5 rounded-lg text-[10px]"
                >
                  {mockConversations.length} NEW
                </Badge>
                <Settings className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search conversations..."
                className="pl-12 h-14 bg-card/40 border-border/40 rounded-2xl font-medium focus:ring-primary/20 backdrop-blur-md"
              />
            </div>
          </div>

          <Card className="flex-1 overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-foreground/5">
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
              {mockConversations.map((conversation) => {
                const other =
                  conversation.participants.find(
                    (p) => p.id !== currentUser.id,
                  ) || mockUsers[0];
                const isSelected = conversation.id === selectedConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-6 cursor-pointer hover:bg-muted/30 transition-all border-l-4 border-transparent relative group",
                      isSelected && "bg-muted/50 border-primary",
                    )}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="flex gap-5">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-4 ring-background shadow-lg transition-transform group-hover:scale-105">
                          <AvatarImage src={other.avatar} />
                          <AvatarFallback className="font-black bg-primary/20 text-primary">
                            {other.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-black truncate tracking-tight">
                            {other.name}
                          </h4>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none ml-2">
                            {new Date(
                              conversation.lastMessage.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-sm truncate font-medium",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                    {/* Unread dot placeholder */}
                    {!isSelected && Math.random() > 0.7 && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 h-2.5 w-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl shadow-foreground/5 h-full relative group/chat">
          <ChatUI
            messages={messages.map((m) => ({
              id: m.id,
              content: m.content,
              senderId: m.senderId,
              timestamp: new Date(m.createdAt),
              conversationId: "mock-conv-id", // Placeholder
              seen: m.read,
              messageType: "text",
            }))}
            currentUser={currentUser}
            otherUser={{
              id: otherUser.id,
              name: otherUser.name,
              avatar: otherUser.avatar,
              status: "online",
            }}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
