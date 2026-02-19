import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatUI } from '@/components/client/ChatUI';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import { mockConversations, mockUsers, Message } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function DeveloperMessages() {
    const [selectedConversationId, setSelectedConversationId] = useState(mockConversations[0].id);
    const [messages, setMessages] = useState<Message[]>(
        mockConversations[0].lastMessage ? [mockConversations[0].lastMessage] : []
    );

    const selectedConversation = mockConversations.find(c => c.id === selectedConversationId);

    // Identify the "other" participant (Client)
    const otherUser = selectedConversation?.participants.find(p => p.id !== 'user-2') || mockUsers[0]; // fallback
    const currentUser = mockUsers.find(u => u.id === 'user-2')!; // Mock developer

    const handleSendMessage = (content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            receiverId: otherUser.id,
            content,
            createdAt: new Date().toISOString(),
            read: false
        };
        setMessages([...messages, newMessage]);
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-8rem)] flex gap-6">
                {/* Sidebar List */}
                <div className="w-80 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-9" />
                    </div>

                    <Card className="flex-1 overflow-hidden">
                        <div className="flex flex-col h-full overflow-y-auto">
                            {mockConversations.map((conversation) => {
                                const other = conversation.participants.find(p => p.id !== currentUser.id) || mockUsers[0];
                                const isSelected = conversation.id === selectedConversationId;

                                return (
                                    <div
                                        key={conversation.id}
                                        className={cn(
                                            "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                            isSelected && "bg-muted/50"
                                        )}
                                        onClick={() => setSelectedConversationId(conversation.id)}
                                    >
                                        <div className="flex gap-3">
                                            <Avatar>
                                                <AvatarImage src={other.avatar} />
                                                <AvatarFallback>{other.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold truncate">{other.name}</h4>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Chat Area */}
                <div className="flex-1">
                    <ChatUI
                        messages={messages}
                        currentUser={currentUser}
                        otherUser={{
                            id: otherUser.id,
                            name: otherUser.name,
                            avatar: otherUser.avatar,
                            status: 'online'
                        }}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
