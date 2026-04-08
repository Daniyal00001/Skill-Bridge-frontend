import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, MoreVertical, Phone, Video, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/client";

interface ChatUIProps {
  messages: Message[];
  currentUser: { id: string; avatar: string };
  otherUser: { id: string; name: string; avatar: string; status: string };
  onSendMessage: (content: string) => void;
}

export function ChatUI({ messages, currentUser, otherUser, onSendMessage }: ChatUIProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full border-0 shadow-none rounded-none md:rounded-lg md:border md:shadow-sm">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 relative">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            <span className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
              otherUser.status === 'online' ? "bg-green-500" : "bg-gray-400"
            )} />
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{otherUser.name}</h3>
            <p className="text-xs text-muted-foreground">
              {otherUser.status === 'online' ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/5">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.id;
              const isAI = msg.isAiMessage === true;
              
              // Only orientation: Me on right, Others/AI on left
              const isRight = isMe;
              const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId || messages[index-1].isAiMessage !== msg.isAiMessage);

              return (
                <div key={msg.id} className={cn(
                  "flex gap-2 max-w-[85%]",
                  isRight ? "ml-auto flex-row-reverse" : "mr-auto"
                )}>
                  {!isRight && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className={cn("h-8 w-8", isAI && "ring-2 ring-purple-400 ring-offset-1")}>
                          {isAI ? (
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 h-full w-full flex items-center justify-center text-white">
                              <Bot className="h-4 w-4" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage src={otherUser.avatar} />
                              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                      ) : <div className="w-8" />}
                    </div>
                  )}

                  <div className="flex flex-col">
                    {isAI && showAvatar && (
                      <span className="text-[10px] font-bold text-purple-600 mb-1 ml-1 uppercase tracking-wider">FreelanceAI</span>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-2 text-sm shadow-sm relative transition-all",
                      isRight
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : isAI 
                          ? "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-800/30 text-foreground rounded-tl-sm border"
                          : "bg-white dark:bg-card text-foreground rounded-tl-sm border"
                    )}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className={cn(
                        "text-[10px] block text-right mt-1 opacity-60",
                        isRight ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <CardFooter className="p-4 border-t bg-background">
        <div className="flex w-full items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="icon"
            className={cn("flex-shrink-0 transition-all", newMessage.trim() ? "opacity-100 scale-100" : "opacity-80 scale-95")}
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}