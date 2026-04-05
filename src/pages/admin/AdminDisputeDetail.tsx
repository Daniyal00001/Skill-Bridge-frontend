import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldAlert,
  Gavel,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Package,
  History,
  Info,
  Building2,
  Mail,
  Zap,
  Tag,
  Paperclip,
  Download,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getDisputeFullDetail,
  updateDisputeStatus,
  resolveDispute,
  type Dispute,
  type DisputeStatus,
  type DisputeResolution,
} from "@/services/dispute.service";
import { cn } from "@/lib/utils";

// ─── Safe date formatter (prevents crashes on null/undefined dates) ──────────
const safeFormat = (date: string | null | undefined, fmt: string, fallback = "—") => {
  if (!date) return fallback;
  const d = new Date(date);
  if (!isValid(d)) return fallback;
  return format(d, fmt);
};

const AdminDisputeDetail = () => {
  const { disputeId } = useParams<{ disputeId: string }>();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [resolutionModal, setResolutionModal] = useState<{
    open: boolean;
    type: DisputeResolution | null;
    note: string;
  }>({ open: false, type: null, note: "" });

  const fetchDetail = useCallback(async () => {
    if (!disputeId) return;
    try {
      setLoading(true);
      const res = await getDisputeFullDetail(disputeId);
      if (res.success) {
        setDispute(res.dispute);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch dispute details");
      navigate("/admin/disputes");
    } finally {
      setLoading(false);
    }
  }, [disputeId, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusUpdate = async (newStatus: DisputeStatus) => {
    if (!disputeId) return;
    try {
      setUpdating(true);
      const res = await updateDisputeStatus(disputeId, newStatus);
      if (res.success) {
        setDispute(res.dispute);
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
        fetchDetail();
      }
    } catch (err: any) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!disputeId || !resolutionModal.type) return;
    try {
      setUpdating(true);
      const res = await resolveDispute(disputeId, resolutionModal.type, resolutionModal.note);
      if (res.success) {
        setDispute(res.dispute);
        toast.success("Dispute resolved successfully. Escrow funds processed.");
        setResolutionModal({ open: false, type: null, note: "" });
        fetchDetail();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resolve dispute");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium italic">Gathering all case evidence...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dispute) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 text-muted-foreground hover:text-foreground gap-1 font-bold"
              onClick={() => navigate("/admin/disputes")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Disputes
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                Case #{dispute?.id?.slice(-6).toUpperCase() || "N/A"}
              </h1>
              <Badge className={cn("px-3 py-1 font-black uppercase text-[10px] tracking-widest", 
                dispute?.status === "OPEN" ? "bg-amber-500/10 text-amber-700 border-amber-400/20" :
                dispute?.status === "UNDER_REVIEW" ? "bg-blue-500/10 text-blue-700 border-blue-400/20" :
                dispute?.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/20" :
                "bg-muted text-muted-foreground"
              )}>
                {dispute?.status?.replace(/_/g, " ") || "UNKNOWN"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">

             {dispute.status !== "RESOLVED" && dispute.status !== "CLOSED" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleStatusUpdate("UNDER_REVIEW")}
                    disabled={updating || dispute.status === "UNDER_REVIEW"}
                  >
                    Set to Under Review
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm"
                    onClick={() => setActiveTab("overview")}
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Resolve Case
                  </Button>
                </div>
             )}
          </div>
        </div>

        {/* Counter-Dispute Alert */}
        {dispute?.relatedDispute && (
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-black text-sm text-amber-900 dark:text-amber-200">
                Counter-Dispute Detected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                The {(!dispute?.filedBy || dispute?.filedBy === "CLIENT") ? "Freelancer" : "Client"} has also filed a separate dispute for this same project. 
                You should review both sides before reaching a final decision.
              </p>
              <Link to={`/admin/disputes/${dispute?.relatedDisputeId}`} className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline mt-1">
                View counterpart's dispute <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <Badge variant="outline" className="bg-amber-100/50 border-amber-200 text-amber-700 font-bold px-3">
              Linked Pair
            </Badge>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-12 w-full max-w-3xl overflow-x-auto justify-start inline-flex">
            <TabsTrigger value="overview" className="rounded-xl px-6 font-bold text-xs gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap">
              <Info className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="project" className="rounded-xl px-6 font-bold text-xs gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5" /> Project
            </TabsTrigger>
            <TabsTrigger value="proposal" className="rounded-xl px-6 font-bold text-xs gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap">
              <Zap className="w-3.5 h-3.5" /> Proposal & Milestones
            </TabsTrigger>
            <TabsTrigger value="contract" className="rounded-xl px-6 font-bold text-xs gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap">
              <Package className="w-3.5 h-3.5" /> Contract & History
            </TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl px-6 font-bold text-xs gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap">
              <MessageSquare className="w-3.5 h-3.5" /> Chat History
            </TabsTrigger>
          </TabsList>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                  <div className={cn("h-2 w-full", dispute?.filedBy === "CLIENT" ? "bg-primary" : "bg-purple-500")} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="font-black text-sm uppercase tracking-widest">Dispute Summary</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold italic">Opened {safeFormat(dispute?.openedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    <CardTitle className="text-xl font-black mt-2 leading-tight">"{dispute?.reason || "Statement Missing"}"</CardTitle>
                    <CardDescription className="flex items-center gap-2 font-bold text-xs mt-1">
                      Filed by {dispute?.filedBy === "CLIENT" ? "Client" : "Freelancer"} •
                      <span className="text-primary">{dispute?.disputeType?.replace(/_/g, " ") || "General"} Issue</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                      <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5 slice-6 opacity-80">
                         <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Full Details Provided by Filer
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {dispute.details || "No complex details provided."}
                      </p>
                    </div>

                    {dispute.evidenceUrls.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5" /> Evidence Attachments ({dispute.evidenceUrls.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {dispute.evidenceUrls.map((url, i) => (
                            <a 
                              key={i} 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="group flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-all"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-xs font-bold truncate">Evidence #{i+1}</span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {dispute?.status === "RESOLVED" && (
                  <Card className="rounded-3xl border-emerald-200 bg-emerald-500/5 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <CardTitle className="text-lg font-black">Official Resolution</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60">Decision</span>
                        <Badge className="w-fit bg-emerald-500 text-white font-black px-4 py-1.5 text-xs shadow-sm">
                          {dispute?.resolution?.replace(/_/g, " ") || "Decision Pending"}
                        </Badge>
                      </div>
                      <div className="space-y-2 py-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60">Admin Note</span>
                         <p className="text-sm font-medium leading-relaxed italic text-emerald-900/80 bg-white/50 p-4 rounded-xl border border-emerald-200/50 underline-offset-4 decoration-emerald-200">
                           "{dispute?.resolutionNote || "No resolution note provided."}"
                         </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-700/40">
                        <span>Resolved by {dispute?.admin?.fullName || "System Admin"}</span>
                        <span>{safeFormat(dispute?.resolvedAt, "MMM d, yyyy")}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Status Controls Sidebar */}
                {dispute.status !== "RESOLVED" && (
                   <Card className="rounded-3xl border-rose-200 shadow-lg shadow-rose-100/50 overflow-hidden sticky top-6 transition-all border-t-4 border-t-rose-600">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-black flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-rose-600" />
                        Administrative Action
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Case Resolution</p>
                         <div className="grid grid-cols-1 gap-2">
                            <Button 
                              variant="outline" 
                              className="justify-start font-bold text-xs h-10 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 border-border/80"
                              onClick={() => setResolutionModal({ open: true, type: "FAVOR_CLIENT", note: "" })}
                            >
                              Favor Client
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start font-bold text-xs h-10 rounded-xl hover:bg-primary-50 hover:text-primary transition-all border-border/80"
                              onClick={() => setResolutionModal({ open: true, type: "FAVOR_FREELANCER", note: "" })}
                            >
                              Favor Freelancer
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start font-bold text-xs h-10 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all border-border/80"
                              onClick={() => setResolutionModal({ open: true, type: "PARTIAL_SPLIT", note: "" })}
                            >
                              Partial Split (50/50)
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start font-bold text-xs h-10 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-all border-border/80"
                              onClick={() => setResolutionModal({ open: true, type: "PROJECT_CANCELLED", note: "" })}
                            >
                              Cancel Project & Refund
                            </Button>
                         </div>
                       </div>
                       
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-3xl border-border/50 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-black uppercase tracking-tight">The Parties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage src={dispute?.client?.profileImage} />
                        <AvatarFallback className="bg-primary/5 text-primary font-black">
                          {dispute?.client?.name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                           <p className="font-black text-sm truncate">{dispute?.client?.name || "Client"}</p>
                           <Badge variant="outline" className="text-[9px] font-black bg-primary/5 text-primary border-primary/10 h-4">CLIENT</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold mt-0.5 truncate flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> {dispute?.client?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-purple-500/20">
                        <AvatarImage src={dispute?.freelancer?.profileImage} />
                        <AvatarFallback className="bg-purple-500/5 text-purple-500 font-black">
                          {dispute?.freelancer?.name?.[0] || "F"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                           <p className="font-black text-sm truncate">{dispute?.freelancer?.name || "Freelancer"}</p>
                           <Badge variant="outline" className="text-[9px] font-black bg-purple-500/5 text-purple-500 border-purple-500/10 h-4 uppercase">Freelancer</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold mt-0.5 truncate flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" /> {dispute?.freelancer?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 2. PROJECT TAB */}
          <TabsContent value="project" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                   Post Date: {safeFormat(dispute?.project?.createdAt, "MMMM d, yyyy", "N/A")}
                </div>
                <CardTitle className="text-3xl font-black tracking-tight leading-tight">{dispute?.project?.title || "Untitled Project"}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 text-xs">
                    Budget: ${dispute?.project?.budget || 0} ({dispute?.project?.budgetType || "FIXED"})
                  </Badge>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-black px-3 py-1 text-xs uppercase tracking-wider">
                    {dispute?.project?.experienceLevel || "INTERMEDIATE"} Level
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-400/20 font-black px-3 py-1 text-xs">
                    {dispute?.project?.category?.name || "Uncategorized"} {dispute?.project?.subCategory && `> ${dispute.project.subCategory.name}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-6 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Comprehensive Description
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 p-6 rounded-2xl border border-border/50 min-h-[150px]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium font-inter">
                      {dispute?.project?.description || "No project description available."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Required Skills & Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {dispute.project?.skills?.map((s, i) => (
                        <span key={i} className="px-4 py-1.5 rounded-xl bg-muted/80 border border-border/50 text-xs font-bold shadow-sm">
                          {s.skill.name}
                        </span>
                      ))}
                      {(!dispute.project?.skills || dispute.project.skills.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">No specific skills listed.</p>
                      )}
                    </div>
                  </div>

                  {dispute.project?.attachments && dispute.project.attachments.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" /> Project Files / Briefs
                      </h4>
                      <div className="space-y-2">
                        {dispute.project.attachments.map((url, i) => (
                          <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="group flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-all"
                          >
                             <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors group-hover:text-white">
                               <FileText className="w-4 h-4" />
                             </div>
                             <span className="text-xs font-bold truncate flex-1">Project Brief Attachment #{i+1}</span>
                             <ExternalLink className="w-3.5 h-3.5 opacity-40" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. PROPOSAL TAB */}
          <TabsContent value="proposal" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <Card className="rounded-3xl border-border/50 shadow-sm h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-400/20 font-black h-5 text-[9px] px-2 tracking-widest uppercase">Accepted Proposal</Badge>
                      <span className="text-[10px] items-center flex gap-1 font-bold text-muted-foreground"><Clock className="w-3 h-3"/> Submitted {dispute.project?.proposals?.[0]?.id && "Nov 12, 2024"}</span>
                    </div>
                    <CardTitle className="text-xl font-black">Original Winning Bid</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     <div className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Bid Amount</p>
                          <p className="text-2xl font-black text-primary">${dispute.project?.proposals?.[0]?.proposedPrice || dispute.project?.budget || "N/A"}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10 self-center bg-border/50" />
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Delivery Est.</p>
                          <p className="text-2xl font-black">{dispute.project?.proposals?.[0]?.deliveryTime || "—"} Days</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5" /> Cover Letter / Pitch
                        </p>
                        <div className="text-sm font-medium leading-relaxed bg-muted/10 p-6 rounded-2xl border border-dashed border-border text-foreground/90 whitespace-pre-wrap">
                          {dispute.project?.proposals?.[0]?.coverLetter || "No cover letter provided in proposal data."}
                        </div>
                     </div>

                     {dispute.project?.proposals?.[0]?.attachments && dispute.project.proposals[0].attachments.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-border/40">
                           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Paperclip className="w-3.5 h-3.5" /> Supporting Pitch Documents
                           </p>
                           <div className="flex flex-wrap gap-3">
                              {dispute.project.proposals[0].attachments.map((url, i) => (
                                <a 
                                  key={i} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border/80 text-[10px] font-black hover:bg-muted transition-colors shadow-sm"
                                >
                                   <FileText className="w-3.5 h-3.5 text-primary" />
                                   Proposal_File_{i+1}.pdf
                                   <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-40" />
                                </a>
                              ))}
                           </div>
                        </div>
                     )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="rounded-3xl border-border/50 shadow-sm h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Agreed Milestone Plan
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-muted-foreground italic">What both parties agreed to at start of contract</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-y-auto max-h-[600px]">
                    {dispute.project?.contract?.milestones?.map((m, i) => (
                      <div key={i} className="group relative flex gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/20 transition-all">
                        <div className="flex flex-col items-center">
                          <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                            {i + 1}
                          </span>
                          {i < (dispute.project?.contract?.milestones?.[0]?.id ? dispute.project.contract.milestones.length - 1 : 0) && (
                            <div className="w-px h-full bg-border/60 mt-1 mb-1" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1 pb-2">
                          <p className="font-black text-sm group-hover:text-primary transition-colors">{m.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1 text-[10px] font-black text-primary">
                               <DollarSign className="w-3 h-3" /> {m.amount}
                             </div>
                             {m.dueDate && (
                               <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                 <Calendar className="w-3 h-3" /> {safeFormat(m.dueDate, "MMM d, yy")}
                               </div>
                             )}
                          </div>
                          {m.description && (
                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed mt-2 line-clamp-2">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!dispute.project?.contract?.milestones || dispute.project.contract.milestones.length === 0) && (
                       <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                          <p className="text-sm font-bold text-muted-foreground opacity-60 italic">No milestones defined for this contract.</p>
                       </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 4. CONTRACT TAB (Deliveries) */}
          <TabsContent value="contract" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
               <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black flex items-center gap-2">
                       <Package className="w-5 h-5 text-primary" /> Active Job Execution
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground italic">Real-time status of work progress and payment escrow</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Project Deadline</p>
                        <p className="text-sm font-black text-emerald-600">
                          {dispute.project?.contract?.endDate ? safeFormat(dispute.project.contract.endDate, "MMM d, yyyy") : "No Deadline"}
                        </p>
                      </div>
                      <div className="space-y-1 mx-4">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Contract Price</p>
                         <p className="text-xl font-black text-primary">${dispute.project?.contract?.agreedPrice}</p>
                      </div>
                     <Badge className="bg-primary text-white font-black px-4 h-8 text-[10px] tracking-widest shadow-sm border-none uppercase">
                        {dispute.project?.contract?.status || "Active"}
                     </Badge>
                  </div>
               </div>
               <CardContent className="p-8 space-y-12">
                  {/* Milestone Feed / Timeline */}
                  <div className="space-y-8">
                     {dispute.project?.contract?.milestones?.map((m, i) => (
                       <div key={i} className="flex gap-6 relative">
                          <div className="flex flex-col items-center shrink-0">
                             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border z-10", 
                                m.status === "APPROVED" ? "bg-emerald-500 border-emerald-400 text-white" :
                                m.status === "SUBMITTED" ? "bg-blue-500 border-blue-400 text-white" :
                                "bg-muted border-border/50 text-muted-foreground"
                             )}>
                                {m.status === "APPROVED" ? <CheckCircle2 className="w-5 h-5" /> :
                                 m.status === "SUBMITTED" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                 <Clock className="w-5 h-5" />}
                             </div>
                             {i < (dispute.project?.contract?.milestones?.length || 0) - 1 && (
                                <div className="w-1 h-full bg-muted/50 mt-1 mb-1 absolute top-10 left-[18px] -z-0" />
                             )}
                          </div>
                          
                          <Card className={cn("flex-1 rounded-2xl border-border/40 shadow-none overflow-hidden transition-all",
                             m.status === "SUBMITTED" ? "border-blue-200 bg-blue-50/20" : ""
                          )}>
                             <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between border-b border-border/10 pb-4 bg-muted/5">
                                <div>
                                  <CardTitle className="text-sm font-black tracking-tight">{m.title}</CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-muted-foreground font-black">Amount: ${m.amount}</p>
                                    {m.dueDate && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground opacity-60">
                                        <Calendar className="w-3 h-3" /> {safeFormat(m.dueDate, "MMM d, yy")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter", 
                                   m.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/20" :
                                   m.status === "SUBMITTED" ? "bg-blue-500/10 text-blue-700 border-blue-400/20" :
                                   m.status === "REVISION_REQUESTED" ? "bg-rose-500/10 text-rose-700 border-rose-400/20" :
                                   "bg-muted text-muted-foreground"
                                )}>
                                   {m.status.replace(/_/g, " ")}
                                </Badge>
                             </CardHeader>
                             <CardContent className="p-5 space-y-5">
                                 {/* Submission Area */}
                                 {m.deliverables && (
                                    <div className="space-y-3">
                                       <div className="flex items-center justify-between">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-80 underline underline-offset-4 decoration-primary/20">
                                             <MessageSquare className="w-3 h-3" /> Freelancer-s Submission Note
                                          </p>
                                          <span className="text-[9px] font-bold text-muted-foreground italic">Submitted {safeFormat(m.submittedAt, "MMM d, yy")}</span>
                                       </div>
                                       <div className="p-4 rounded-xl bg-white/50 border border-border/40 text-sm font-medium leading-relaxed italic text-foreground/80">
                                         "{m.deliverables}"
                                       </div>
                                       
                                       {m.attachments && m.attachments.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-2">
                                             {m.attachments.map((url, i) => (
                                                <a 
                                                  key={i} 
                                                  href={url} 
                                                  target="_blank" 
                                                  rel="noreferrer"
                                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-200 text-[10px] font-black text-blue-700 hover:bg-blue-500 hover:text-white transition-all shadow-sm group"
                                                >
                                                   <Download className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                                   Deliverable_{i+1}_File
                                                </a>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 )}

                                 {/* Revision Request */}
                                 {m.status === "REVISION_REQUESTED" && m.revisionNote && (
                                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-200 space-y-2">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1.5">
                                          <History className="w-3 h-3" /> Revision Request History
                                       </p>
                                       <p className="text-xs font-semibold leading-relaxed text-rose-900/80 italic">
                                          "{m.revisionNote}"
                                       </p>
                                    </div>
                                 )}

                                 {/* Event Timeline (History) */}
                                 {m.history && Array.isArray(m.history) && m.history.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border/40 mt-4">
                                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                          <History className="w-3 h-3" /> Milestone Event Journal
                                       </p>
                                       <div className="space-y-3 pl-2 border-l-2 border-border/30 ml-1">
                                          {m.history.map((h: any, j: number) => (
                                             <div key={j} className="relative pl-6 pb-2 last:pb-0">
                                                <div className="absolute left-[-9px] top-[4px] w-4 h-4 rounded-full bg-muted border-2 border-background z-10" />
                                                <div className="space-y-1">
                                                   <div className="flex items-center justify-between">
                                                      <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80">{h.type.replace(/_/g, " ")}</span>
                                                      <span className="text-[9px] font-bold text-muted-foreground">{safeFormat(h.timestamp, "MMM d, yyyy h:mm a")}</span>
                                                   </div>
                                                   <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{h.content}</p>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                             </CardContent>
                          </Card>
                       </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          {/* 5. CHAT TAB */}
          <TabsContent value="chat" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 h-full">
             <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <CardHeader className="border-b bg-muted/20 pb-4">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-black flex items-center gap-2">
                         <MessageSquare className="w-5 h-5 text-primary" />
                         Project Communication Log
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-bold bg-background">
                         Official Platform Record
                      </Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                   <ScrollArea className="h-full p-6">
                      <div className="space-y-6">
                        {(() => {
                          // Combine all possible rooms from project and contract
                          const projectRooms = dispute?.project?.chatRooms || [];
                          const contractRooms = dispute?.project?.contract?.chatRooms || [];
                          const allRooms = [...projectRooms, ...contractRooms];

                          // Collect ALL messages from ALL rooms
                          const allMessages: any[] = [];
                          allRooms.forEach(room => {
                            if (room.messages) {
                               allMessages.push(...room.messages);
                            }
                          });

                          // De-duplicate by message ID and sort chronologically (oldest first)
                          const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
                          const sortedMessages = uniqueMessages.sort((a, b) => 
                            new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                          );

                          if (sortedMessages.length > 0) {
                            return sortedMessages.map((msg: any) => (
                              <div
                                key={msg.id}
                                className={cn(
                                  "flex flex-col max-w-[85%] space-y-1.5",
                                  msg.sender?.role === "CLIENT"
                                    ? "mr-auto"
                                    : "ml-auto items-end",
                                )}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {msg.sender?.role === "CLIENT" && (
                                    <Avatar className="w-5 h-5 border">
                                      <AvatarImage src={msg.sender?.profileImage} />
                                      <AvatarFallback className="text-[8px] font-bold">
                                        {msg.sender?.name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                                    {msg.sender?.name} ({msg.sender?.role})
                                  </span>
                                  {msg.sender?.role !== "CLIENT" && (
                                    <Avatar className="w-5 h-5 border">
                                      <AvatarImage src={msg.sender?.profileImage} />
                                      <AvatarFallback className="text-[8px] font-bold">
                                        {msg.sender?.name?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "p-4 rounded-2xl text-sm font-medium shadow-sm border",
                                    msg.sender?.role === "CLIENT"
                                      ? "bg-white border-border/60 rounded-tl-none"
                                      : "bg-primary text-primary-foreground border-primary/20 rounded-tr-none",
                                  )}
                                >
                                  {msg.content}
                                  {msg.type === "FILE" && msg.fileUrl && (
                                    <a
                                      href={msg.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-all text-xs border border-white/10"
                                    >
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span className="truncate">
                                        View shared file
                                      </span>
                                    </a>
                                  )}
                                </div>
                                <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                                  {safeFormat(msg.sentAt, "MMM d, h:mm a")}
                                </span>
                              </div>
                            ));
                          }

                          return (
                            <div className="flex flex-col items-center justify-center h-full py-32 text-center gap-4 opacity-30 grayscale">
                              <MessageSquare className="w-16 h-16" />
                              <p className="text-sm font-black uppercase tracking-widest">
                                No messages exchanged found before conflict
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                   </ScrollArea>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Resolution Note Modal */}
        <Dialog 
          open={resolutionModal.open} 
          onOpenChange={(open) => setResolutionModal(prev => ({ ...prev, open }))}
        >
          <DialogContent className="rounded-3xl border-rose-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-xl flex items-center gap-2 text-rose-600">
                <Gavel className="w-5 h-5" />
                Resolve Case
              </DialogTitle>
              <DialogDescription className="font-bold text-xs italic">
                You are about to issue a final decision for Case #{dispute.id.slice(-6).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Selected Resolution</p>
                 <Badge className="bg-rose-600 text-white font-black px-3 py-1 text-[10px] tracking-widest">
                   {resolutionModal.type?.replace(/_/g, " ")}
                 </Badge>
                 <p className="text-xs font-medium text-muted-foreground mt-3 leading-relaxed">
                   {resolutionModal.type === "FAVOR_CLIENT" && "All escrowed funds will be returned to the client's balance."}
                   {resolutionModal.type === "FAVOR_FREELANCER" && "All escrowed funds will be released to the freelancer's balance."}
                   {resolutionModal.type === "PARTIAL_SPLIT" && "Funds will be split 50/50 between both parties."}
                   {resolutionModal.type === "PROJECT_CANCELLED" && "Project will be marked as cancelled and funds refunded to client."}
                 </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Case Resolution Note</Label>
                <Textarea 
                  placeholder="Explain the reasoning behind this decision..."
                  className="rounded-2xl min-h-[120px] resize-none border-border/60 focus:ring-rose-500/20 focus:border-rose-500/40"
                  value={resolutionModal.note}
                  onChange={(e) => setResolutionModal(prev => ({ ...prev, note: e.target.value }))}
                />
                <p className="text-[9px] font-bold text-muted-foreground italic px-1">
                  This note will be visible to both the Client and Freelancer.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl font-bold h-11 border-border/60"
                onClick={() => setResolutionModal({ open: false, type: null, note: "" })}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black h-11 shadow-lg shadow-rose-200"
                onClick={handleResolve}
                disabled={updating}
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Resolution"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDisputeDetail;
