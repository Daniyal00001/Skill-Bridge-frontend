import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bot, Send, CheckCircle, XCircle,
    Clock, FileText, ArrowLeft, Sparkles, User
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface NegotiationMessage {
    id: string;
    role: "ai" | "freelancer";
    content: string;
    timestamp: Date;
}

interface NegotiationResult {
    freelancerId: string;
    freelancerName: string;
    status: 'ACCEPTED' | 'PENDING' | 'DECLINED' | 'COUNTERED' | 'NO_REPLY';
    finalPrice?: number;
    aiReply?: string;
    notes: string;
}

interface FreelancerMatch {
    id: string;
    name: string;
    location: string;
    skills: string[];
    hourlyRate: number;
    matchScore: number;
    estimatedTotal: number;
}

const API_URL = "http://localhost:5000/api/ai/assistant";

const NegotiationPage = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<NegotiationMessage[]>([]);
    const [freelancerInput, setFreelancerInput] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
    const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerMatch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stage, setStage] = useState("NEGOTIATE");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping]);

    // ── Load initial negotiation state ───────────────────────
    useEffect(() => {
        if (sessionId) loadNegotiationState();
    }, [sessionId]);

    const loadNegotiationState = async () => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    message: "show negotiation status",
                    clientName: "Client",
                }),
            });

            const data = await response.json();

            if (data.stage) setStage(data.stage);

            // Get first negotiation result (selected freelancer)
            if (data.negotiationSummary && data.negotiationSummary.length > 0) {
                const result = data.negotiationSummary[0];
                setNegotiationResult(result);

                // Add AI outreach message to chat
                if (result.notes) {
                    setMessages([{
                        id: "1",
                        role: "ai",
                        content: result.notes,
                        timestamp: new Date(),
                    }]);
                }
            }

            if (data.matches && data.matches.length > 0) {
                setSelectedFreelancer(data.matches[0]);
            }

        } catch (error) {
            console.error("Failed to load negotiation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Freelancer sends reply → AI responds ─────────────────
    const handleFreelancerReply = async () => {
        if (!freelancerInput.trim() || !sessionId || isAiTyping) return;

        const freelancerMsg: NegotiationMessage = {
            id: Date.now().toString(),
            role: "freelancer",
            content: freelancerInput,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, freelancerMsg]);
        setFreelancerInput("");
        setIsAiTyping(true);

        try {
            // Send freelancer response to backend for AI to analyze and reply
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    message: `Freelancer replied: ${freelancerInput}`,
                    clientName: "Client",
                    freelancerResponses: [{
                        freelancerId: negotiationResult?.freelancerId || "",
                        freelancerName: negotiationResult?.freelancerName || "",
                        replyText: freelancerInput,
                    }],
                }),
            });

            const data = await response.json();

            setIsAiTyping(false);

            if (data.stage) setStage(data.stage);

            // Add AI reply to chat
            if (data.negotiationSummary && data.negotiationSummary.length > 0) {
                const result = data.negotiationSummary[0];
                setNegotiationResult(result);

                if (result.aiReply) {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "ai",
                        content: result.aiReply!,
                        timestamp: new Date(),
                    }]);
                }

                // If accepted → redirect to contract
                if (result.status === 'ACCEPTED' || data.stage === 'CONTRACT') {
                    setTimeout(() => {
                        navigate(`/client/contract/${sessionId}`);
                    }, 2000);
                }
            }

        } catch (error: any) {
            setIsAiTyping(false);
            console.error("Negotiation error:", error.message);
        }
    };

    // ── Status badge ──────────────────────────────────────────
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return <Badge className="bg-emerald-500 text-white gap-1"><CheckCircle className="h-3 w-3" />Deal Accepted!</Badge>;
            case 'DECLINED':
                return <Badge className="bg-red-500 text-white gap-1"><XCircle className="h-3 w-3" />Declined</Badge>;
            case 'COUNTERED':
                return <Badge className="bg-amber-500 text-white gap-1"><Clock className="h-3 w-3" />Counter Offer</Badge>;
            default:
                return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Negotiating...</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-80px)] flex flex-col p-4 md:p-6 gap-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/client/ai-assistant')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">Negotiation</h1>
                            <p className="text-xs text-muted-foreground">
                                AI is negotiating on your behalf
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {negotiationResult && getStatusBadge(negotiationResult.status)}
                        {(negotiationResult?.status === 'ACCEPTED' || stage === 'CONTRACT') && (
                            <Button
                                className="gap-2"
                                onClick={() => navigate(`/client/contract/${sessionId}`)}
                            >
                                <FileText className="h-4 w-4" />
                                Generate Contract
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex gap-4 min-h-0">

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden">

                        {/* Freelancer Info Header */}
                        {selectedFreelancer && (
                            <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedFreelancer.name)}`} />
                                    <AvatarFallback>{selectedFreelancer.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{selectedFreelancer.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedFreelancer.location} · ${selectedFreelancer.hourlyRate}/hr</p>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <Badge variant="outline" className="text-xs font-mono">{stage}</Badge>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3">
                                        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-sm text-muted-foreground">Loading negotiation...</p>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3">
                                        <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                                        <p className="text-sm text-muted-foreground">Waiting for AI outreach message...</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3",
                                            msg.role === "freelancer" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "ai" && (
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                                                <Sparkles className="h-4 w-4 text-white" />
                                            </div>
                                        )}

                                        <div className={cn("max-w-[75%] space-y-1", msg.role === "freelancer" && "items-end flex flex-col")}>
                                            <p className="text-[10px] font-semibold text-muted-foreground px-1">
                                                {msg.role === "ai" ? "🤖 AI (on behalf of client)" : "👤 Freelancer"}
                                            </p>
                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                                                msg.role === "ai"
                                                    ? "bg-muted border border-border rounded-tl-none"
                                                    : "bg-primary text-primary-foreground rounded-tr-none"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground px-1">
                                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        {msg.role === "freelancer" && (
                                            <div className="h-9 w-9 rounded-xl bg-muted border flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* AI typing indicator */}
                            {isAiTyping && (
                                <div className="flex gap-3 justify-start">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="bg-muted border border-border p-4 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}

                            {/* Deal accepted message */}
                            {negotiationResult?.status === 'ACCEPTED' && (
                                <div className="flex justify-center">
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 text-center space-y-2">
                                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
                                        <p className="font-bold text-emerald-600">Deal Accepted!</p>
                                        <p className="text-xs text-muted-foreground">Redirecting to contract generation...</p>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Freelancer Input */}
                        <div className="p-4 border-t bg-muted/20">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground font-medium">
                                    Freelancer reply (type as if you are the freelancer)
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Type freelancer's response here..."
                                    value={freelancerInput}
                                    onChange={(e) => setFreelancerInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !isAiTyping && handleFreelancerReply()}
                                    disabled={isAiTyping || negotiationResult?.status === 'ACCEPTED' || negotiationResult?.status === 'DECLINED'}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleFreelancerReply}
                                    disabled={!freelancerInput.trim() || isAiTyping || negotiationResult?.status === 'ACCEPTED'}
                                    className="gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Send
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel — Status */}
                    <div className="w-72 flex flex-col gap-4">

                        {/* Project Summary */}
                        <Card>
                            <CardContent className="p-5 space-y-3">
                                <h3 className="font-semibold text-sm">Negotiation Status</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Status</span>
                                        {negotiationResult && getStatusBadge(negotiationResult.status)}
                                    </div>
                                    {negotiationResult?.finalPrice && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Agreed Price</span>
                                            <span className="font-bold">${negotiationResult.finalPrice.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Messages</span>
                                        <span className="font-semibold">{messages.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-5 space-y-3">
                                <h3 className="font-semibold text-sm text-primary">How it works</h3>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex gap-2">
                                        <span className="text-primary font-bold">1.</span>
                                        <span>AI sends outreach on client's behalf</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary font-bold">2.</span>
                                        <span>Freelancer types their reply below</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary font-bold">3.</span>
                                        <span>AI analyzes and negotiates back</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-primary font-bold">4.</span>
                                        <span>Deal agreed → Contract generated</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-2">
                            {(negotiationResult?.status === 'ACCEPTED' || stage === 'CONTRACT') && (
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => navigate(`/client/contract/${sessionId}`)}
                                >
                                    <FileText className="h-4 w-4" />
                                    Generate Contract
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/client/ai-assistant')}
                            >
                                Back to AI Assistant
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NegotiationPage;