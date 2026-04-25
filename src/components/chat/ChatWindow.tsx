import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Paperclip,
  Send,
  ChevronUp,
  CheckCheck,
  Check,
  Loader2,
  FileText,
  ChevronRight,
  Sparkles,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatRoom } from "@/services/chat.service";
import { AttachmentPreview } from "./AttachmentPreview";
import { ChatOptions } from "./ChatOptions";
import { SendContractModal } from "../modals/SendContractModal";
import { format, isToday, isYesterday } from "date-fns";
import { api } from "@/lib/api";

interface ChatWindowProps {
  room: ChatRoom;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserRole?: string;
  typingUsers: { userId: string; userName: string }[];
  isLoadingMessages: boolean;
  isUploading: boolean;
  hasMore: boolean;
  onSendMessage: (content: string) => void;
  onSendAttachment: (files: File[]) => void;
  onLoadMore: () => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onMute: (muted: boolean) => Promise<void>;
  onRestrict: (targetUserId: string, restricted: boolean) => Promise<void>;
  onDelete: (roomId: string) => Promise<void>;
}

function formatMessageTime(date: string | Date): string {
  const d = new Date(date);
  return format(d, "HH:mm");
}

function formatDateSeparator(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function shouldShowDateSeparator(
  curr: ChatMessage,
  prev?: ChatMessage,
): boolean {
  if (!prev) return true;
  const currDate = new Date(curr.sentAt).toDateString();
  const prevDate = new Date(prev.sentAt).toDateString();
  return currDate !== prevDate;
}

export function ChatWindow({
  room,
  messages,
  currentUserId,
  typingUsers,
  isLoadingMessages,
  isUploading,
  hasMore,
  onSendMessage,
  onSendAttachment,
  onLoadMore,
  onStartTyping,
  onStopTyping,
  onMute,
  onRestrict,
  onDelete,
  currentUserRole,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const other = room.otherUser;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingUsers.length]);

  // IntersectionObserver for load more (infinite scroll at top)
  useEffect(() => {
    if (!topRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  // Expand textarea auto-height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (e.target.value.length > 0) onStartTyping();
    else onStopTyping();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      // Check for 500MB limit
      const oversized = files.filter((f) => f.size > 500 * 1024 * 1024);
      if (oversized.length > 0) {
        toast.error(`Some files are too large. Maximum allowed is 500MB.`);
        return;
      }
      onSendAttachment(files);
    }
    e.target.value = "";
  };

  const handleSuggestReply = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    
    // Add a specialized toast for the process
    const toastId = toast.loading("AI is analyzing the conversation...", {
      description: "Generating a strategic next message...",
      icon: <Sparkles className="h-4 w-4 animate-spin text-amber-500" />
    });

    try {
      const response = await api.post("/ai/assistant/suggest-reply", {
        roomId: room.id,
        role: currentUserRole
      });
      const data = response.data;
      if (data.success && data.suggestion) {
        setInput(data.suggestion);
        onStartTyping();
        toast.success("Strategic response generated!", {
          id: toastId,
          description: "You can now edit the message before sending.",
          icon: <Wand2 className="h-4 w-4 text-amber-500" />,
        });
      } else {
        throw new Error(data.message || "Failed to generate suggestion");
      }
    } catch (err) {
      console.error("AI Suggestion error:", err);
      toast.error("AI Suggestion failed", {
        id: toastId,
        description: "Please try again in a moment."
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onSendAttachment(files);
    },
    [onSendAttachment],
  );

  return (
    <div
      className="flex flex-col h-full bg-card border rounded-2xl overflow-hidden shadow-sm"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center">
          <p className="text-primary font-semibold text-lg">
            Drop files to send
          </p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={other?.avatar ?? undefined} />
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {other?.name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                other?.isOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight">
                {other?.name ?? "Unknown"}
              </h3>
              {room.isActiveAI && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider animate-pulse">
                  AI Managed
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {other?.isOnline
                ? "Active now"
                : other?.lastActiveAt
                  ? `Last seen ${format(new Date(other.lastActiveAt), "MMM d, HH:mm")}`
                  : "Offline"}
            </p>
          </div>
        </div>
        <ChatOptions
          room={room}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onMute={onMute}
          onRestrict={onRestrict}
          onDelete={onDelete}
        />
      </div>


      {/* ── Messages ── */}
      <ScrollArea className="flex-1 px-4 py-3">
        {/* Load More trigger ref */}
        <div ref={topRef} />

        {hasMore && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMessages}
              className="gap-1 text-xs text-muted-foreground"
            >
              <ChevronUp className="h-3 w-3" />
              {isLoadingMessages ? "Loading..." : "Load earlier messages"}
            </Button>
          </div>
        )}

        {isLoadingMessages && messages.length === 0 && (
          <div className="space-y-4 animate-pulse py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  i % 2 === 0 ? "flex-row-reverse" : "",
                )}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                <div
                  className={cn(
                    "h-10 rounded-2xl bg-muted",
                    i % 2 === 0 ? "w-40" : "w-52",
                  )}
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1 py-2">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const prev = messages[idx - 1];
            const next = messages[idx + 1];
            const showAvatar =
              !isMe && (!next || next.senderId !== msg.senderId);
            const isGrouped = idx > 0 && prev?.senderId === msg.senderId;
            const showDate = shouldShowDateSeparator(msg, prev);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground font-medium px-2">
                      {formatDateSeparator(msg.sentAt)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                {msg.type === "SYSTEM" ? (
                  <div className="flex justify-center my-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 max-w-[85%] shadow-sm animate-in fade-in zoom-in-95 duration-500">
                      {msg.content.includes("Contract Invitation Sent") ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                System Notification
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                Contract Offer Extended
                              </p>
                            </div>
                          </div>
                          <div className="bg-background/50 rounded-xl p-3 border border-border/40">
                            <p className="text-[13px] font-medium text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {msg.content
                                .replace(/\*\*/g, "")
                                .replace(/📄 /g, "")
                                .replace(/\[View Invitation Details\]\s*\((.*?)\)/g, "")
                                .trim()}
                            </p>
                          </div>
                          <div className="flex justify-center pt-1">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-xs font-bold text-primary hover:no-underline flex items-center gap-1 group"
                              asChild
                            >
                              <Link
                                to={(() => {
                                  const rawUrl =
                                    msg.content.match(/\((.*?)\)/)?.[1] || "#";
                                  if (
                                    currentUserRole === "CLIENT" &&
                                    rawUrl.includes("/freelancer/invitations/")
                                  ) {
                                    return rawUrl.replace(
                                      "/freelancer/invitations/",
                                      "/client/invites/",
                                    );
                                  }
                                  return rawUrl;
                                })()}
                              >
                                View Full Details
                                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground font-bold text-center uppercase tracking-[0.2em]">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex gap-2 w-full",
                      isMe ? "flex-row-reverse" : "flex-row",
                      isGrouped ? "mt-0.5" : "mt-3",
                    )}
                  >
                    {/* Avatar placeholder (aligns bubbles) */}
                    {!isMe && (
                      <div className="w-8 flex-shrink-0 self-end">
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={msg.sender.profileImage ?? undefined}
                            />
                            <AvatarFallback className="text-xs font-bold">
                              {msg.sender.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[72%] flex flex-col",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      {/* Sender name (only for group chats or first in group) */}
                      {!isMe && !isGrouped && (
                        <span className="text-[11px] text-muted-foreground font-semibold mb-1 ml-1">
                          {msg.sender.name}
                        </span>
                      )}

                      {/* Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm",
                          isGrouped && isMe
                            ? "rounded-tr-2xl rounded-br-sm"
                            : "",
                          isGrouped && !isMe
                            ? "rounded-tl-2xl rounded-bl-sm"
                            : "",
                        )}
                      >
                        {msg.type === "FILE" ? (
                          <AttachmentPreview
                            fileUrl={msg.fileUrl!}
                            fileName={msg.fileName}
                            fileSize={msg.fileSize}
                            fileMimeType={msg.fileMimeType}
                            isOwn={isMe}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        )}

                        {/* Timestamp + seen status */}
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            isMe ? "justify-end" : "justify-end",
                          )}
                        >
                          {msg.isAiMessage && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "h-3.5 px-1 py-0 text-[8px] font-bold uppercase mr-1",
                                isMe 
                                  ? "border-primary-foreground/30 text-primary-foreground" 
                                  : "border-primary/30 text-primary bg-primary/5"
                              )}
                            >
                              AI Agent
                            </Badge>
                          )}
                          <span
                            className={cn(
                              "text-[10px] opacity-70 font-medium",
                              isMe
                                ? "text-primary-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {format(new Date(msg.sentAt), "HH:mm")}
                          </span>
                          {isMe && (
                            <div className="flex items-center">
                              {msg.isRead ? (
                                <CheckCheck className="h-3.5 w-3.5 text-cyan-300 ml-0.5 drop-shadow-sm" />
                              ) : (
                                <Check className="h-3 w-3 text-primary-foreground/60 ml-0.5" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex gap-2 mt-3">
              <div className="w-8 flex-shrink-0" />
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="text-xs text-muted-foreground mr-1">
                    {typingUsers[0].userName} is typing
                  </span>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* 🚀 Smart Suggestion Buttons */}
      {room.isActiveAI && currentUserRole === "CLIENT" && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t bg-muted/20 animate-in slide-in-from-bottom-2 duration-300">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-7 rounded-full border-primary/20 bg-background hover:bg-primary/5 transition-colors gap-1.5"
            onClick={() => onSendMessage("Can you offer a competitive discount for this project?")}
          >
            <span role="img" aria-label="discount">💸</span> Ask for discount
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-7 rounded-full border-primary/20 bg-background hover:bg-primary/5 transition-colors gap-1.5"
            onClick={() => onSendMessage("What is your earliest possible delivery date?")}
          >
            <span role="img" aria-label="clock">⏱️</span> Faster delivery?
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] h-7 rounded-full border-primary/20 bg-background hover:bg-primary/5 transition-colors gap-1.5"
            onClick={() => onSendMessage("The terms look great. I would like to proceed and finalize our agreement!")}
          >
             <span role="img" aria-label="shake">🤝</span> Accept & Close
          </Button>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="px-4 py-3 border-t bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* File attachment */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "flex-shrink-0 text-muted-foreground hover:text-primary h-10 w-10",
              isUploading && "animate-pulse text-primary pointer-events-none",
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Attach file"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>

          {/* Text input */}
          <div className="flex-1 relative group">
            {isSuggesting && (
                <div className="absolute inset-x-0 -top-10 flex justify-center animate-in slide-in-from-bottom-2">
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        SkillBridge AI is thinking...
                    </div>
                </div>
            )}
            <textarea
              id="chat-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isUploading ? "Uploading attachments..." : "Type a message..."
              }
              disabled={isUploading}
              rows={1}
              maxLength={2050}
              className={cn(
                "w-full resize-none rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-4 py-3",
                "text-sm leading-relaxed outline-none transition-all duration-300",
                "focus:ring-4 focus:ring-primary/10 focus:border-primary/50 shadow-inner",
                input.length > 2000 ? "border-destructive/50" : "",
                "max-h-48 overflow-y-auto placeholder:text-muted-foreground/50",
              )}
            />
          </div>

          {/* Send & AI Tools */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUserRole === "CLIENT" &&
              room.otherUser?.role === "FREELANCER" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-primary hover:bg-primary/5 rounded-2xl border border-primary/10 shadow-sm transition-all hover:scale-105 active:scale-95"
                  onClick={() => setIsContractModalOpen(true)}
                  title="Send Contract"
                >
                  <FileText className="h-5 w-5" />
                </Button>
              )}
            
            {/* 🌟 Premium AI Magic Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 relative overflow-hidden group/ai",
                "bg-gradient-to-br from-amber-50 via-white to-amber-50/50",
                "hover:from-amber-100 hover:to-amber-50",
                "rounded-2xl border border-amber-200/60 shadow-sm transition-all",
                "hover:shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5 active:scale-95",
                isSuggesting && "pointer-events-none"
              )}
              onClick={handleSuggestReply}
              disabled={isSuggesting || isUploading}
              title="Generate AI Response"
            >
              {isSuggesting ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
                  <Wand2 className="h-5 w-5 text-amber-600 drop-shadow-sm group-hover/ai:scale-110 transition-transform duration-300" />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[9px] font-bold rounded opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    MAGIC SUGGEST
                  </div>
                </>
              )}
            </Button>

            <Button
              size="icon"
              className={cn(
                "h-11 w-11 rounded-2xl transition-all duration-300",
                input.trim() && input.length <= 2000 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 active:scale-95" 
                  : "bg-muted text-muted-foreground opacity-50 pointer-events-none",
              )}
              onClick={handleSend}
              disabled={!input.trim() || input.length > 2000}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1 px-1">
          <div className="flex items-center gap-4 ml-12">
            <p className="text-[10px] text-muted-foreground/50">
              Drag & drop files • Press Enter to send
            </p>
            {input.length > 0 && (
              <p className={cn(
                "text-[10px] transition-colors",
                input.length > 2000 ? "text-destructive font-black" : "text-muted-foreground/40"
              )}>
                {input.length}/2000
              </p>
            )}
          </div>
          {currentUserRole === "CLIENT" &&
            room.otherUser?.role === "FREELANCER" && (
              <p className="text-[10px] text-primary/70 font-bold italic animate-pulse">
                💡 Pro-tip: Send a formal contract using the icon above!
              </p>
            )}
        </div>
      </div>

      {/* Contract Modal */}
      {currentUserRole === "CLIENT" &&
        room.otherUser?.role === "FREELANCER" &&
        room.freelancerProfileId && (
          <SendContractModal
            isOpen={isContractModalOpen}
            onClose={() => setIsContractModalOpen(false)}
            freelancerId={room.freelancerProfileId}
            freelancerName={room.otherUser.name || "Freelancer"}
            projectId={room.projectId || undefined}
          />
        )}
    </div>
  );
}
