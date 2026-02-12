import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChatUI } from "@/components/client/ChatUI";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/client";

// Mock Conversation Data
const MOCK_CONVERSATIONS = [
    {
        id: "conv-1",
        participant: {
            id: "dev-1",
            name: "Alex Chen",
            avatar: "https://i.pravatar.cc/150?u=alex",
            status: "online",
            role: "Senior Full Stack Dev"
        },
        lastMessage: {
            content: "Sure, let me check the requirements doc.",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
            unread: true
        },
        unreadCount: 2
    },
    {
        id: "conv-2",
        participant: {
            id: "dev-2",
            name: "Sarah Jones",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            status: "offline",
            role: "UI/UX Designer"
        },
        lastMessage: {
            content: "I've uploaded the new mockups to Figma.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            unread: false
        },
        unreadCount: 0
    },
    {
        id: "conv-3",
        participant: {
            id: "dev-3",
            name: "Michael Brown",
            avatar: "https://i.pravatar.cc/150?u=mike",
            status: "online",
            role: "Backend Architect"
        },
        lastMessage: {
            content: "The API endpoint is ready for testing.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            unread: false
        },
        unreadCount: 0
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    "conv-1": [
        { id: "m1", senderId: "me", content: "Hi Alex, did you see the updated brief?", timestamp: new Date(Date.now() - 1000 * 60 * 30), seen: true, conversationId: "conv-1", messageType: "text" },
        { id: "m2", senderId: "dev-1", content: "Yes, I'm reviewing it now. Looks good.", timestamp: new Date(Date.now() - 1000 * 60 * 25), seen: true, conversationId: "conv-1", messageType: "text" },
        { id: "m3", senderId: "dev-1", content: "One question about the auth flow though.", timestamp: new Date(Date.now() - 1000 * 60 * 24), seen: true, conversationId: "conv-1", messageType: "text" },
        { id: "m4", senderId: "me", content: "Go ahead.", timestamp: new Date(Date.now() - 1000 * 60 * 10), seen: true, conversationId: "conv-1", messageType: "text" },
        { id: "m5", senderId: "dev-1", content: "Sure, let me check the requirements doc.", timestamp: new Date(Date.now() - 1000 * 60 * 5), seen: false, conversationId: "conv-1", messageType: "text" },
    ],
    "conv-2": [
        { id: "m1", senderId: "dev-2", content: "Hey! Just started on the wireframes.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), seen: true, conversationId: "conv-2", messageType: "text" },
        { id: "m2", senderId: "me", content: "Great! Let me know when you have something to show.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), seen: true, conversationId: "conv-2", messageType: "text" },
        { id: "m3", senderId: "dev-2", content: "I've uploaded the new mockups to Figma.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), seen: true, conversationId: "conv-2", messageType: "text" },
    ]
};

const ClientMessagesPage = () => {
    const [searchParams] = useSearchParams();
    const userIdParam = searchParams.get('user');

    // Logic to auto-select conversation if coming from "Open Chat" button
    const initialActiveId = userIdParam
        ? MOCK_CONVERSATIONS.find(c => c.participant.id === userIdParam)?.id || MOCK_CONVERSATIONS[0].id
        : MOCK_CONVERSATIONS[0].id;

    const [activeConversationId, setActiveConversationId] = useState<string>(initialActiveId);
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [messages, setMessages] = useState(MOCK_MESSAGES);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = messages[activeConversationId] || [];

    const currentUser = {
        id: "me",
        avatar: "https://github.com/shadcn.png"
    };

    const activeParticipant = activeConversation
        ? activeConversation.participant
        : { id: "unknown", name: "Unknown User", avatar: "", status: "offline" };

    const handleSendMessage = (content: string) => {
        const newMessage: Message = {
            id: `new-${Date.now()}`,
            senderId: currentUser.id,
            content,
            timestamp: new Date(),
            seen: false,
            conversationId: activeConversationId,
            messageType: "text"
        };

        setMessages(prev => ({
            ...prev,
            [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
        }));

        // Update last message in conversation list
        setConversations(prev => prev.map(c =>
            c.id === activeConversationId
                ? { ...c, lastMessage: { content, timestamp: new Date().toISOString(), unread: false } }
                : c
        ));
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)] flex gap-6 p-4 md:p-6 animate-fade-in overflow-hidden">
                {/* Chat List Sidebar - Hidden on mobile if chat active (responsive logic can be improved) */}
                <div className={cn(
                    "w-full md:w-80 flex flex-col bg-card border rounded-lg shadow-sm flex-shrink-0",
                    "hidden md:flex" // Simple responsive hiding for now
                )}>
                    <div className="p-4 border-b space-y-4">
                        <h2 className="font-semibold text-lg">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search chats..." className="pl-9 bg-muted/50" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                    activeConversationId === conv.id
                                        ? "bg-primary/10 hover:bg-primary/15"
                                        : "hover:bg-muted"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={conv.participant.avatar} />
                                        <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {conv.participant.status === 'online' && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={cn("font-medium truncate", conv.unreadCount > 0 && "font-bold")}>
                                            {conv.participant.name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "text-xs truncate max-w-[140px]",
                                            conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                        )}>
                                            {conv.lastMessage.content}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                                {conv.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Chat Window */}
                <div className="flex-1 flex flex-col h-full min-w-0">
                    {activeConversation ? (
                        <ChatUI
                            messages={activeMessages}
                            currentUser={currentUser}
                            otherUser={activeParticipant}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-card border rounded-lg text-muted-foreground">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientMessagesPage;
