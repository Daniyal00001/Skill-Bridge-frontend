import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  Send,
  Mic,
  User,
  Bot,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Search,
  TrendingUp,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockFreelancers, Freelancer } from "@/lib/mockData";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [matches, setMatches] = useState<Freelancer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [step, setStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (content: string = input) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI Logic
    setTimeout(() => {
      let aiResponse = "";
      const currentStep = step;

      if (currentStep === 0) {
        aiResponse =
          "That sounds like an interesting project! To help me find the best match, could you tell me about your budget range?";
        setStep(1);
      } else if (currentStep === 1) {
        aiResponse =
          "Got it. And what's your expected timeline for completion?";
        setStep(2);
      } else if (currentStep === 2) {
        aiResponse =
          "Perfect. One last thing: are there any specific technologies or experience levels you're prioritizing?";
        setStep(3);
      } else if (currentStep === 3) {
        aiResponse =
          "Excellent. I'm now analyzing our talent pool to find the perfect matches for your requirements...";
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content:
                "I've found 3 top-rated freelancers who match your project needs perfectly! You can see them in the results panel on the right.",
              timestamp: new Date(),
            },
          ]);
          setMatches(mockFreelancers.slice(0, 3));
          setShowResults(true);
        }, 2000);
        return;
      } else {
        aiResponse =
          "I'm here to help! Is there anything else you'd like to know about these freelancers or should I help with another search?";
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  const suggestionChips = [
    "I need a React developer for 3 months",
    "Find me a UI/UX designer under $50/hr",
    "I need a mobile app built in 2 weeks",
    "Looking for a Python backend developer",
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 overflow-hidden animate-fade-in">
        {/* Chat Interface (Left - 60%) */}
        <div className="flex-1 flex flex-col bg-card/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  SkillBridge AI
                </h2>
                <div className="flex items-center gap-1.5 ">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Online • Your intelligent talent finder
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-primary/5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
                <div className="space-y-2">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold gradient-text">
                    How can I help you today?
                  </h3>
                  <p className="text-muted-foreground">
                    Describe your project and I'll find the perfect freelancers
                    from our global talent pool.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {suggestionChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="p-3 text-sm text-left rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group flex items-center gap-2"
                    >
                      <MessageSquare className="h-3 w-3 text-primary opacity-50 group-hover:opacity-100" />
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full animate-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] flex gap-3",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <Avatar className="h-8 w-8 border border-white/10 flex-shrink-0">
                      {msg.role === "ai" ? (
                        <div className="h-full w-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          ME
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "p-4 rounded-2xl text-sm shadow-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white/10 backdrop-blur-md border border-white/10 text-foreground rounded-tl-none",
                        )}
                      >
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-white/5">
            <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Input
                  placeholder="Describe your project or ask anything..."
                  className="pr-20 py-6 bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary/50 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground pr-2 tabular-nums">
                    {input.length}/500
                  </span>
                </div>
              </div>
              <Button
                className="h-12 w-12 rounded-xl bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Panel (Right - 40%) */}
        <div className="w-full lg:w-[40%] flex flex-col bg-card/30 backdrop-blur-sm rounded-2xl border border-white/5 transition-all duration-500 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Matched Freelancers</h2>
            </div>
            {matches.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary hover:bg-primary/20"
              >
                {matches.length} Matches Found
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {!showResults ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                  <Search className="h-10 w-10 text-primary/20" />
                </div>
                <div>
                  <p className="font-medium text-lg">Analysis Pending</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chat with SkillBridge AI to analyze your requirements and
                    find the perfect match.
                  </p>
                </div>
              </div>
            ) : (
              matches.map((f, idx) => (
                <Card
                  key={f.id}
                  className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 animate-in fade-in slide-in-from-right-4"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                          <AvatarImage src={f.avatar} />
                          <AvatarFallback>{f.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 bg-success text-[8px] font-bold text-white px-1 rounded-full border border-card">
                          9{8 - idx}% Match
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 underline-offset-4 decoration-primary/50 group-hover:underline">
                          <h3 className="font-bold truncate">{f.name}</h3>
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {f.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[11px] font-medium">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            {f.rating}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            ${f.hourlyRate}/hr
                          </div>
                          <div className="text-[11px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            Available
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {f.skills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 bg-white/5 border-none"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {f.skills.length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-medium pl-1">
                          +{f.skills.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-[11px] bg-transparent border-white/10 hover:bg-primary/10"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-[11px] bg-primary/80 hover:bg-primary"
                      >
                        Start Conversation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
