import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles, Send, Mic, Bot, Search, Star,
  Zap, Globe, Clock, BrainCircuit, MapPin,
  CheckCircle, XCircle, Clock3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "ai" | "user";
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
  availability: boolean;
}

interface NegotiationResult {
  freelancerId: string;
  freelancerName: string;
  status: 'ACCEPTED' | 'PENDING' | 'DECLINED' | 'COUNTERED' | 'NO_REPLY';
  finalPrice?: number;
  notes: string;
}

const API_URL = "http://localhost:5000/api/ai/assistant";

const AIAssistantPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [matches, setMatches] = useState<FreelancerMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("UNDERSTAND");
  const [negotiationResults, setNegotiationResults] = useState<NegotiationResult[]>([]);
  const [hiringFreelancer, setHiringFreelancer] = useState<string | null>(null);
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

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId || undefined,
          clientName: "Client",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.stage) setStage(data.stage);

      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
        timestamp: new Date(),
      }]);

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setShowResults(true);
      }

      if (data.negotiationSummary && data.negotiationSummary.length > 0) {
        setNegotiationResults(data.negotiationSummary);
      }

    } catch (error: any) {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      }]);
    }
  };

  // ── Hire only the selected freelancer ────────────────────
  const handleHire = async (freelancer: FreelancerMatch) => {
    if (!sessionId || isTyping) return;

    setHiringFreelancer(freelancer.id);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I want to hire ${freelancer.name}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: `I want to hire ${freelancer.name}`,
          clientName: "Client",
          // Pass selected freelancer ID so backend contacts only this one
          selectedFreelancerId: freelancer.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.stage) setStage(data.stage);

      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
        timestamp: new Date(),
      }]);

      if (data.negotiationSummary && data.negotiationSummary.length > 0) {
        setNegotiationResults(data.negotiationSummary);
      }

      // ✅ Redirect to negotiation page
      if (data.stage === "NEGOTIATE" && data.sessionId) {
        setTimeout(() => {
          navigate(`/client/negotiation/${data.sessionId}`);
        }, 1500);
      }

    } catch (error: any) {
      setIsTyping(false);
      console.error("Hire error:", error.message);
    } finally {
      setHiringFreelancer(null);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setMatches([]);
    setShowResults(false);
    setSessionId(null);
    setStage("UNDERSTAND");
    setNegotiationResults([]);
    setHiringFreelancer(null);
  };

  const getNegotiationStatus = (freelancerId: string) => {
    return negotiationResults.find(r => r.freelancerId === freelancerId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-emerald-500 text-white text-[10px]"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'DECLINED':
        return <Badge className="bg-red-500 text-white text-[10px]"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'COUNTERED':
        return <Badge className="bg-amber-500 text-white text-[10px]"><Clock3 className="h-3 w-3 mr-1" />Countered</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-[10px]"><Clock3 className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-4 lg:p-6 bg-background">

        {/* Chat Interface (Left) */}
        <div className="flex-1 flex flex-col bg-card rounded-3xl border border-border shadow-sm overflow-hidden relative">
          <div className="px-6 py-5 border-b border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-tight text-foreground">AI Project Assistant</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {stage === "MATCH" ? "Freelancers found! Click Hire to proceed." :
                      stage === "NEGOTIATE" ? "Negotiating — redirecting..." :
                        stage === "CONTRACT" ? "Ready to generate contract!" :
                          "Ready to help find your matches"}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {sessionId && <Badge variant="outline" className="text-xs font-mono">{stage}</Badge>}
              <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold" onClick={handleClear}>
                Clear Chat
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-2xl mx-auto py-10 animate-slide-up">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">How can I help with your project?</h3>
                  <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                    Tell me about the project you're working on, and I'll find the best freelancers for your specific needs.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                  {[
                    { text: "I need a React Native mobile app", icon: Zap, desc: "Mobile development" },
                    { text: "Build me a UI/UX design for my SaaS", icon: Globe, desc: "Visual design & research" },
                    { text: "I need a Ramadan app in 2 months", icon: Clock, desc: "Fast delivery project" },
                    { text: "I need an AI chatbot with Python", icon: BrainCircuit, desc: "AI & ML expertise" },
                  ].map((chip) => (
                    <button
                      key={chip.text}
                      onClick={() => handleSend(chip.text)}
                      className="group p-4 text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start gap-4"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                        <chip.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug text-foreground">{chip.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{chip.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full animate-in slide-in-from-bottom-4 duration-500", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
                        {msg.role === "ai" ? (
                          <div className="h-full w-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-black">ME</AvatarFallback>
                        )}
                      </Avatar>
                      {msg.role === "ai" && <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-white dark:border-[#1e293b]" />}
                    </div>
                    <div className="space-y-2">
                      <div className={cn("p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                        msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border")}>
                        {msg.content}
                      </div>
                      <p className={cn("text-[10px] font-medium text-muted-foreground px-1", msg.role === "user" ? "text-right" : "text-left")}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white/40 dark:bg-black/20 border-t border-white/10 backdrop-blur-md">
            <div className="relative flex items-center gap-3 max-w-5xl mx-auto">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Tell me about your project needs..."
                  className="pr-12 h-12 bg-background border-border rounded-xl focus-visible:ring-primary/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                  disabled={isTyping}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2"
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
              >
                Send <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Panel (Right) */}
        <div className="w-full lg:w-[350px] flex flex-col bg-card rounded-3xl border border-border shadow-sm overflow-hidden relative">
          <div className="px-6 py-5 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground">
              {stage === "NEGOTIATE" ? "Negotiation Status" : stage === "CONTRACT" ? "Contract Ready" : "Recommendations"}
            </h2>
            {matches.length > 0 && <Badge variant="secondary" className="font-semibold">{matches.length} Matches</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {!showResults ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No recommendations yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a conversation to find the right freelancers.</p>
                </div>
              </div>
            ) : (
              matches.map((f) => {
                const negotiation = getNegotiationStatus(f.id);
                return (
                  <Card key={f.id} className="group overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-200 rounded-2xl shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Avatar className="h-14 w-14 rounded-xl">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(f.name)}`} />
                          <AvatarFallback>{f.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-base truncate text-foreground">{f.name}</h3>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{f.matchScore}%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <p className="text-xs truncate">{f.location || "Remote"}</p>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-semibold">New</span>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">${f.hourlyRate}/hr</span>
                            <span className="text-xs text-muted-foreground">~${f.estimatedTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {negotiation && (
                        <div className="mt-3 flex items-center justify-between">
                          {getStatusBadge(negotiation.status)}
                          {negotiation.finalPrice && (
                            <span className="text-xs font-semibold text-foreground">${negotiation.finalPrice.toLocaleString()}</span>
                          )}
                        </div>
                      )}

                      <p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">{f.matchReason}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {f.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 font-medium">{skill}</Badge>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="secondary" className="flex-1 h-9 rounded-lg text-xs font-semibold">Profile</Button>
                        <Button
                          className="flex-1 h-9 rounded-lg text-xs font-semibold"
                          onClick={() => handleHire(f)}
                          disabled={isTyping || hiringFreelancer === f.id || negotiation?.status === 'ACCEPTED'}
                        >
                          {hiringFreelancer === f.id ? "Hiring..." :
                            negotiation?.status === 'ACCEPTED' ? "✅ Hired!" : "Hire"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
