import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles, Send, Mic, Bot, Search, Star,
  Zap, Globe, Clock, BrainCircuit, MapPin,
  CheckCircle, Plus, ChevronLeft, ChevronRight,
  MoreVertical, Trash2, Edit2, Share2, Paperclip,
  Cpu, Layout, MessageSquare, History, Users, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";

// --- Types ---
interface Message {
  id: string;
  role: "ai" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FreelancerMatch {
  id: string;
  name: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  bio: string;
  matchScore: number;
  matchReason: string;
  estimatedTotal: number;
}

const API_URL = "http://localhost:5000/api/ai/assistant";

// --- Sub-components ---

const ChatMessage = memo(({ msg, user }: { msg: Message; user: any }) => {
  const isAI = msg.role === "ai" || msg.role === "assistant";
  
  return (
    <div className={cn(
      "flex w-full mb-8", 
      !isAI ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[95%] lg:max-w-[90%] flex gap-4", 
        !isAI ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className={cn(
          "h-10 w-10 border-0 shrink-0 mt-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform hover:scale-110",
          isAI ? "bg-gradient-to-br from-primary via-primary/90 to-accent text-white" : "bg-card border-none"
        )}>
          {isAI ? (
            <Bot className="h-5 w-5 drop-shadow-md" />
          ) : (
            <>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-[12px] font-extrabold uppercase bg-primary/10 text-primary">{user?.name?.[0]}</AvatarFallback>
            </>
          )}
        </Avatar>

        <div className={cn(
          "flex flex-col",
          !isAI ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all",
            !isAI 
              ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none shadow-[0_8px_20px_rgba(79,70,229,0.2)]" 
              : "bg-card/80 backdrop-blur-md text-foreground rounded-tl-none border border-border/60 shadow-xl ring-1 ring-white/20"
          )}>
            {/* Subtle glow for AI messages */}
            {isAI && <div className="absolute top-0 right-0 h-10 w-10 bg-primary/5 blur-xl pointer-events-none" />}
            
            <div className={cn(
              "text-[16px] leading-relaxed font-medium",
              isAI ? "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-headings:font-bold" : ""
            )}>
              {isAI ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-2 px-1 opacity-60 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
});

const FreelancerCard = memo(({ f, onDeploy }: { f: FreelancerMatch; onDeploy: (name: string, id: string) => void }) => {
  return (
    <div className="group relative bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:border-primary/40 hover:-translate-y-2 overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <Avatar className="h-28 w-28 border-4 border-background shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-110">
          <AvatarImage src={f.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${f.name}&backgroundColor=003366,006699,330066`} />
          <AvatarFallback className="font-black text-2xl">{f.name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 right-0 bg-gradient-to-br from-primary to-accent text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-background">
          {f.matchScore}% Match
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-black text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{f.name}</h3>
        <div className="flex items-center justify-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-primary" /> {f.location}</span>
          <span className="w-1 h-1 rounded-full bg-primary/30" />
          <span className="text-primary font-black opacity-100">${f.hourlyRate}/hr</span>
        </div>
      </div>

      <p className="text-sm text-foreground/70 line-clamp-3 mb-6 leading-relaxed italic px-2">
        "{f.matchReason}"
      </p>

      <div className="w-full flex flex-wrap justify-center gap-2 mb-8">
        {f.skills.slice(0, 3).map(s => (
          <Badge key={s} variant="secondary" className="px-3 py-1 text-[10px] bg-primary/5 text-primary border-primary/10 font-bold hover:bg-primary/10 transition-colors rounded-lg">
            {s}
          </Badge>
        ))}
      </div>

       <Button 
          className="w-full mt-auto h-14 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-black text-[11px] uppercase tracking-[0.15em] hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all duration-300 border-none shadow-xl"
          onClick={() => onDeploy(f.name, f.id)}
       >
          <Sparkles className="w-4 h-4 mr-2" />
          Deploy Strategist
       </Button>
    </div>
  );
});

// --- Main Page ---

async function handleShare(sessionId: string | null) {
  if (!sessionId) {
    toast.error("Start a conversation first to share!");
    return;
  }
  
  const shareUrl = `${window.location.origin}/share/chat/${sessionId}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Public chat link copied to clipboard!", {
      description: "Anyone with this link can view the conversation summary.",
      icon: <Share2 className="h-4 w-4 text-emerald-500" />,
      duration: 3000,
    });
  } catch (err) {
    toast.error("Failed to copy link. Please try manually.");
  }
}

const AIAssistantPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [matches, setMatches] = useState<FreelancerMatch[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("UNDERSTAND");
  const [memory, setMemory] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string, name: string } | null>(null);
  const [pendingFreelancerId, setPendingFreelancerId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "smooth") => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior
      });
    }
  }, []);

  const handleSend = useCallback(async (content: string = input, selectedId?: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) return;

    const attachmentToUse = attachmentUrl || selectedFile?.url;
    const freelancerIdToUse = selectedId || pendingFreelancerId;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: attachmentToUse ? `${content}\n\n📎 Attached: ${selectedFile?.name || "File"}` : content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedFile(null);
    setPendingFreelancerId(null);
    setIsTyping(true);

    try {
      const resp = await api.post("/ai/assistant/message", {
        message: content,
        sessionId: sessionId || undefined,
        clientName: user?.name || "Client",
        clientId: user?.id,
        selectedFreelancerId: freelancerIdToUse || undefined,
        attachments: attachmentToUse ? [attachmentToUse] : []
      });

      const data = resp.data;

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.stage) setStage(data.stage);
      if (data.memory) setMemory(data.memory);

      setIsTyping(false);
      
      if (data.chatRoomId) {
        toast.success(data.reply);
        navigate(`/chat/${data.chatRoomId}`);
        return;
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
        timestamp: new Date(),
      }]);

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }

    } catch (error: any) {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    }
  }, [input, sessionId, user]);

  const loadSession = async (sid: string) => {
    if (sid === sessionId) return;
    
    setIsTyping(true);
    try {
       const resp = await api.get(`/ai/assistant/session/${sid}`);
       const data = resp.data;
       if (data.success) {
          setSessionId(data.sessionId);
          setStage(data.stage);
          setMemory(data.memory);
          setMatches(data.matches || []);
          
          if (data.history) {
             const msgs = data.history.map((m: any, i: number) => ({
                id: `${sid}-${i}`,
                role: (m.role === "assistant" ? "ai" : m.role) as "ai" | "user",
                content: m.content,
                timestamp: new Date()
             }));
             setMessages(msgs);
             setTimeout(() => scrollToBottom("auto"), 50);
          }
       }
    } catch (e) {
       console.error("Load session error:", e);
    } finally {
       setIsTyping(false);
    }
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.", {
        description: "Please try using Chrome or Edge for voice features."
      });
      return;
    }
    
    if (isListening) {
      if ((window as any)._recognition) (window as any)._recognition.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      (window as any)._recognition = recognition;
      toast.info("Microphone active", { 
        id: "listening-toast", 
        description: "Speak now, I'm listening...",
        duration: 3000, 
        icon: <Mic className="h-4 w-4 animate-pulse text-primary" /> 
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      
      let message = "Voice input error.";
      let description = "Please try again.";

      if (event.error === 'not-allowed') {
        message = "Microphone access denied.";
        description = "Please enable microphone permissions in your browser settings.";
      } else if (event.error === 'no-speech') {
        message = "No speech detected.";
        description = "I didn't hear anything. Please try speaking again.";
      } else if (event.error === 'service-not-allowed') {
        message = "Voice service unavailable.";
        description = "Your browser or device doesn't allow voice recognition right now.";
      }

      toast.error(message, { description });
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setInput(finalTranscript);
        // Short delay before sending to ensure user is done
        if (finalTranscript.trim().length >= 4) {
          setTimeout(() => {
            handleSend(finalTranscript.trim());
          }, 500);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start error:", e);
      setIsListening(false);
    }
  }, [isListening, handleSend]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      // Use the existing chat attachment endpoint via auto-auth api client
      const resp = await api.post(`/chat/rooms/temp/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = resp.data;
      if (data.success) {
        setSelectedFile({
          url: data.data[0].fileUrl,
          name: file.name
        });
        toast.success("File uploaded and attached!");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (user?.id) {
       const fetchSessions = async () => {
        try {
          const resp = await api.get(`/ai/assistant/sessions?clientId=${user?.id}`);
          const data = resp.data;
          if (data.success) {
            setSessions(data.sessions || []);
          }
        } catch (e) {
          console.error("Fetch sessions error:", e);
        }
      };
      fetchSessions();
    }
  }, [user]);

  const handleDeploy = (name: string, id: string) => {
    const draftContent = `I have selected ${name} as my project strategist. Let's initialize the coordination and discuss the next steps!`;
    setInput(draftContent);
    setPendingFreelancerId(id);
    
    // Auto-expand textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        textareaRef.current.focus();
      }
    }, 100);

    toast.info(`Message pre-filled for ${name}`, {
      description: "Review and send the message to start formal coordination.",
      icon: <Bot className="h-4 w-4 text-primary" />,
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setMatches([]);
    setSessionId(null);
    setStage("UNDERSTAND");
    setMemory(null);
    setPendingFreelancerId(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-background overflow-hidden relative">
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Sidebar: Chat History */}
          <aside className={cn(
            "bg-card border-r flex flex-col transition-all duration-300 z-20 absolute lg:relative inset-y-0 left-0 shadow-2xl lg:shadow-none",
            isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-0"
          )}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-xs flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <History className="h-3.5 w-3.5" />
                Recent Chats
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-md lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-3">
              <Button 
                className="w-full justify-start gap-3 h-10 rounded-lg shadow-md font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all border-none"
                onClick={handleNewChat}
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center px-4">
                  <Bot className="h-8 w-8 mb-3" />
                  <p className="text-xs font-semibold">No recent chats</p>
                </div>
              ) : (
                sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((s) => (
                  <button
                    key={s.sessionId}
                    onClick={() => loadSession(s.sessionId)}
                    className={cn(
                        "w-full px-3 py-3 rounded-lg text-left transition-all border group relative",
                        sessionId === s.sessionId 
                          ? "bg-primary/5 border-primary/20" 
                          : "hover:bg-accent/50 border-transparent"
                    )}
                  >
                     <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                           <p className={cn(
                             "font-semibold text-xs truncate capitalize",
                             sessionId === s.sessionId ? "text-primary" : "text-foreground/90"
                           )}>{s.title || "New Discussion"}</p>
                           {sessionId === s.sessionId && (
                             <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                           )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate opacity-70">
                          {s.lastMessage || "Beginning conversation..."}
                        </p>
                     </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-muted/30">
               <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[11px] truncate leading-tight">{user?.name}</p>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">Verified Client</p>
                  </div>
               </div>
            </div>
          </aside>

          {/* Main Chat Interface */}
          <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
            
            {/* Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10 w-full">
              <div className="flex items-center gap-4">
                {!isSidebarOpen && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-md transition-all hover:bg-accent"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-bold text-sm">
                    AI Project Assistant
                  </h2>
                  {stage !== "UNDERSTAND" && (
                    <Badge variant="outline" className="text-[9px] h-4.5 font-bold uppercase tracking-tight border-primary/20 text-primary bg-primary/5">
                      {stage}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg" 
                   title="Share discussion"
                   onClick={() => handleShare(sessionId)}
                 >
                    <Share2 className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg" onClick={handleNewChat} title="Clear conversation">
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </header>

            {/* Chat Body */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 py-10 lg:px-0 custom-scrollbar scroll-smooth"
            >
              <div className="max-w-3xl mx-auto">
                {messages.length === 0 ? (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 mt-12 animate-in fade-in zoom-in-95 duration-1000">
                    <div className="relative group mb-10">
                      <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                      <div className="h-24 w-24 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-[2rem] flex items-center justify-center mx-auto relative shadow-[0_20px_40px_rgba(79,70,229,0.4)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out z-10 border border-white/20">
                        <Bot className="h-10 w-10 text-white drop-shadow-xl" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to your Project Hub</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed mb-12 opacity-80">
                      I'm your AI strategist. Describe your project requirements and I'll help you architect the perfect solution.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                      {[
                        { text: "Build a modern SaaS MVP", icon: Zap },
                        { text: "Create a design system", icon: Layout },
                        { text: "Find a full-stack developer", icon: Users },
                        { text: "Help me write a job description", icon: MessageSquare },
                      ].map((chip) => (
                        <button
                          key={chip.text}
                          onClick={() => handleSend(chip.text)}
                          className="flex items-center gap-3.5 p-4 text-left rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/20 transition-all duration-300 group text-[13px] font-medium shadow-sm"
                        >
                          <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                              <chip.icon className="h-4 w-4" />
                          </div>
                          <span>{chip.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pb-10">
                    <AnimatePresence initial={false} mode="popLayout">
                      {messages.map((m) => (
                        <motion.div 
                          key={m.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChatMessage msg={m} user={user} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {matches.length > 0 && (
                      <div className="mt-10 border-t pt-8">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2 opacity-80 mb-6">
                           <Users className="h-3 w-3" /> Recommended Strategists
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AnimatePresence mode="popLayout">
                            {matches.map(f => (
                               <motion.div 
                                 key={f.id}
                                 layout
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.9 }}
                               >
                                 <FreelancerCard f={f} onDeploy={handleDeploy} />
                               </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex justify-start mb-8 animate-in fade-in duration-300">
                          <div className="bg-card border border-border/50 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Input Overlay */}
            <div className="p-4 lg:p-8 bg-gradient-to-t from-background via-background/95 to-transparent relative">
              <div className="max-w-3xl mx-auto relative z-10">
                {selectedFile && (
                  <div className="mb-2 flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-bottom-2">
                    <Paperclip className="h-3 w-3 text-primary" />
                    <span className="text-[11px] font-bold text-primary truncate max-w-[200px]">{selectedFile.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-auto hover:bg-primary/10 text-primary"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="relative flex items-end gap-2 bg-card border rounded-2xl p-2 pr-3 shadow-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  <textarea
                    ref={textareaRef}
                    placeholder="Message SkillBridge AI..."
                    className="flex-1 min-h-[48px] max-h-[250px] bg-transparent border-none focus:ring-0 text-[14px] font-medium placeholder:text-muted-foreground/30 px-4 py-3 resize-none scrollbar-none"
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isTyping) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isTyping}
                  />
                  
                  <div className="flex items-center gap-1 pb-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={cn(
                        "h-10 w-10 text-muted-foreground hover:text-primary rounded-xl transition-all", 
                        isListening && "text-destructive bg-destructive/5 animate-pulse"
                      )}
                      onClick={startListening}
                      title="Voice Input"
                    >
                       <Mic className="h-4.5 w-4.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={cn(
                        "h-10 w-10 text-muted-foreground hover:text-primary rounded-xl transition-all",
                        isUploading && "animate-pulse"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      title="Attach File"
                    >
                       <Paperclip className="h-4.5 w-4.5" />
                    </Button>
                    <Button 
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all",
                        !input.trim() || isTyping ? "bg-muted text-muted-foreground opacity-50" : "bg-primary text-white shadow-md hover:bg-primary/90"
                      )}
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium opacity-30 italic">
                  Advanced Project Orchestration v3.0 • Powered by SkillBridge AI
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
