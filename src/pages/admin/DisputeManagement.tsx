import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Scale,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ShieldAlert,
  TrendingUp,
  FileText,
  Eye,
  Gavel,
  ChevronRight,
  Loader2,
  RefreshCw,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  Paperclip,
  MessageSquare,
  ArrowUpRight,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getAllDisputes,
  getDisputeById,
  updateDisputeStatus,
  resolveDispute,
  type Dispute,
  type DisputeStatus,
  type DisputeResolution,
  type DisputeStats,
} from "@/services/dispute.service";

// ─── Constants ───────────────────────────────────────────────────────────────

const DISPUTE_TYPE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  PAYMENT: {
    label: "Payment",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    emoji: "💰",
  },
  SCOPE: {
    label: "Scope of Work",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    emoji: "📄",
  },
  DEADLINE: {
    label: "Deadline",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    emoji: "⏰",
  },
  QUALITY: {
    label: "Quality",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    emoji: "🧪",
  },
  REVISION: {
    label: "Revision",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    emoji: "🔁",
  },
  DELIVERABLES: {
    label: "Deliverables",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    emoji: "📂",
  },
  IP: {
    label: "Intellectual Property",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    emoji: "🔐",
  },
};

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    color: "text-zinc-600",
    bg: "bg-zinc-100",
    border: "border-zinc-200",
    dot: "bg-zinc-400",
  },
};

const RESOLUTION_OPTIONS: { value: DisputeResolution; label: string; icon: string }[] = [
  { value: "FAVOR_CLIENT", label: "Favour Client (Refund)", icon: "👤" },
  { value: "FAVOR_FREELANCER", label: "Favour Freelancer (Release payment)", icon: "🧑‍💻" },
  { value: "PARTIAL_SPLIT", label: "Partial Split (50/50 or custom)", icon: "⚖️" },
  { value: "PROJECT_CANCELLED", label: "Cancel Project", icon: "❌" },
  { value: "DISMISSED", label: "Dismiss Dispute", icon: "🚫" },
];

const FILTER_TABS: { key: DisputeStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl transition-all hover:shadow-md",
        accent && value > 0 ? "border-red-200 bg-red-50/40" : "border-border/50"
      )}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dispute Card ────────────────────────────────────────────────────────────

function DisputeCard({
  dispute,
  onView,
  onChangeStatus,
  onResolve,
}: {
  dispute: Dispute;
  onView: (d: Dispute) => void;
  onChangeStatus: (d: Dispute, status: DisputeStatus) => void;
  onResolve: (d: Dispute) => void;
}) {
  const typeMeta = DISPUTE_TYPE_META[dispute.disputeType] ?? DISPUTE_TYPE_META["PAYMENT"];
  const statusMeta = STATUS_META[dispute.status] ?? STATUS_META["OPEN"];
  const isResolved = dispute.status === "RESOLVED" || dispute.status === "CLOSED";
  const clientName =
    dispute.client?.clientProfile?.fullName || dispute.client?.name || "Client";
  const freelancerName =
    dispute.freelancer?.freelancerProfile?.fullName ||
    dispute.freelancer?.name ||
    "Freelancer";

  return (
    <Card className="border border-border/60 rounded-2xl overflow-hidden hover:shadow-md transition-all group">
      {/* Colored left accent */}
      <div
        className={cn(
          "h-1 w-full",
          dispute.status === "OPEN"
            ? "bg-gradient-to-r from-rose-400 to-pink-400"
            : dispute.status === "UNDER_REVIEW"
            ? "bg-gradient-to-r from-blue-500 to-indigo-400"
            : dispute.status === "RESOLVED"
            ? "bg-gradient-to-r from-emerald-400 to-teal-400"
            : "bg-gradient-to-r from-zinc-300 to-zinc-200"
        )}
      />

      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Type badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-md shrink-0 mt-0.5",
                typeMeta.color,
                typeMeta.bg,
                typeMeta.border
              )}
            >
              {typeMeta.emoji} {typeMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-semibold border px-2 py-0.5 rounded-md",
                statusMeta.color,
                statusMeta.bg,
                statusMeta.border
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", statusMeta.dot)} />
              {statusMeta.label}
            </span>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors"
              onClick={() => onView(dispute)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Linked Dispute Badge */}
        {dispute.relatedDisputeId && (
          <div className="mb-3">
             <Badge variant="outline" className="bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[9px] px-2 py-0.5 flex items-center gap-1.5 w-fit">
                <AlertTriangle className="w-3 h-3" />
                Linked Counter-Dispute Detected
             </Badge>
          </div>
        )}

        {/* Project title */}
        <h3 className="font-semibold text-sm text-foreground mb-1 break-words">
          📁 {dispute.project?.title || "Project"}
        </h3>

        {/* Reason */}
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 italic break-words">
          "{dispute.reason}"
        </p>

        {/* Parties row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={dispute.client?.profileImage || ""} />
              <AvatarFallback className="text-[10px] font-bold bg-blue-100 text-blue-700">
                {clientName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Client
              </p>
              <p className="text-xs font-semibold truncate">{clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={dispute.freelancer?.profileImage || ""} />
              <AvatarFallback className="text-[10px] font-bold bg-violet-100 text-violet-700">
                {freelancerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Freelancer
              </p>
              <p className="text-xs font-semibold truncate">{freelancerName}</p>
            </div>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(dispute.openedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {dispute.project?.budget && (
              <span className="flex items-center gap-1 font-medium text-foreground/70">
                <DollarSign className="h-3 w-3" />
                {dispute.project.budget.toLocaleString()}
              </span>
            )}
            {dispute.project?.contract?.endDate && (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded font-black text-[9px] uppercase tracking-tighter">
                <Calendar className="h-3 w-3" />
                {new Date(dispute.project.contract.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {dispute.evidenceUrls.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {dispute.evidenceUrls.length} files
              </span>
            )}
          </div>

          {!isResolved && (
            <div className="flex items-center gap-1.5">
              {dispute.status === "OPEN" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2.5 font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 rounded-lg"
                  onClick={() => onChangeStatus(dispute, "UNDER_REVIEW")}
                >
                  Review
                </Button>
              )}
              {dispute.status === "UNDER_REVIEW" && (
                <Button
                  size="sm"
                  className="h-7 text-[11px] px-2.5 font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-lg gap-1"
                  onClick={() => onResolve(dispute)}
                >
                  <Gavel className="h-3 w-3" />
                  Resolve
                </Button>
              )}
            </div>
          )}

          {isResolved && (
            <span
              className={cn(
                "text-[11px] font-semibold border px-2 py-0.5 rounded-md",
                STATUS_META["RESOLVED"].color,
                STATUS_META["RESOLVED"].bg,
                STATUS_META["RESOLVED"].border
              )}
            >
              {dispute.resolution?.replace(/_/g, " ") || "Resolved"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DisputeDetailModal({
  disputeId,
  open,
  onClose,
}: {
  disputeId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dispute", disputeId],
    queryFn: () => getDisputeById(disputeId!),
    enabled: !!disputeId && open,
  });

  const dispute = data?.dispute;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            Dispute Details
          </DialogTitle>
          <DialogDescription>Full case information</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {dispute && (
          <div className="space-y-5 pt-2">
            {/* Project + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Project
                </p>
                <p className="font-semibold text-sm break-words">{dispute.project?.title}</p>
                <p className="text-xs text-muted-foreground">
                  Budget: ${dispute.project?.budget?.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Dispute Type
                </p>
                {(() => {
                  const m = DISPUTE_TYPE_META[dispute.disputeType] || DISPUTE_TYPE_META["PAYMENT"];
                  return (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-md",
                        m.color, m.bg, m.border
                      )}
                    >
                      {m.emoji} {m.label}
                    </span>
                  );
                })()}
                <p className="text-xs text-muted-foreground mt-1">
                  Opened:{" "}
                  {new Date(dispute.openedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Client",
                  user: dispute.client,
                  name:
                    dispute.client?.clientProfile?.fullName || dispute.client?.name,
                  sub: dispute.client?.clientProfile?.company,
                  avatarBg: "bg-blue-100",
                  avatarColor: "text-blue-700",
                },
                {
                  label: "Freelancer",
                  user: dispute.freelancer,
                  name:
                    dispute.freelancer?.freelancerProfile?.fullName ||
                    dispute.freelancer?.name,
                  sub: dispute.freelancer?.freelancerProfile?.tagline,
                  avatarBg: "bg-violet-100",
                  avatarColor: "text-violet-700",
                },
              ].map(({ label, user, name, sub, avatarBg, avatarColor }) => (
                <div key={label} className="bg-muted/40 rounded-xl p-3.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {label}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage || ""} />
                      <AvatarFallback
                        className={cn("text-xs font-bold", avatarBg, avatarColor)}
                      >
                        {name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                      <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reason + Details */}
            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wide mb-1">
                  Reported Issue
                </p>
                <p className="text-sm font-medium text-foreground break-words">{dispute.reason}</p>
              </div>
              {dispute.details && (
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Additional Details
                  </p>
                  <p className="text-sm text-muted-foreground break-words">{dispute.details}</p>
                </div>
              )}
            </div>

            {/* Evidence */}
            {dispute.evidenceUrls.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Evidence Files ({dispute.evidenceUrls.length})
                </p>
                <div className="space-y-1.5">
                  {dispute.evidenceUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary hover:underline bg-muted/40 rounded-lg px-3 py-2"
                    >
                      <Paperclip className="h-3 w-3" />
                      Evidence File {i + 1} <ArrowUpRight className="h-3 w-3 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution (if resolved) */}
            {dispute.resolution && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                  Resolution
                </p>
                <p className="text-sm font-semibold">
                  {dispute.resolution.replace(/_/g, " ")}
                </p>
                {dispute.resolutionNote && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {dispute.resolutionNote}
                  </p>
                )}
                {dispute.resolvedAt && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Resolved on{" "}
                    {new Date(dispute.resolvedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {dispute.admin && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    By: {dispute.admin.fullName}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="border-t border-border/50 pt-4 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button 
            className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              if (disputeId) {
                navigate(`/admin/disputes/${disputeId}`);
                onClose();
              }
            }}
          >
            <Eye className="h-4 w-4" />
            View Full Case & Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Resolve Modal ───────────────────────────────────────────────────────────

function ResolveModal({
  dispute,
  open,
  onClose,
}: {
  dispute: Dispute | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState<DisputeResolution | "">("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () => resolveDispute(dispute!.id, resolution as DisputeResolution, note),
    onSuccess: () => {
      toast.success("Dispute resolved successfully");
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      onClose();
      setResolution("");
      setNote("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to resolve dispute");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onClose();
        setResolution("");
        setNote("");
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-foreground" />
            Resolve Dispute
          </DialogTitle>
          <DialogDescription className="break-all whitespace-pre-wrap">
            {dispute?.project?.title} — Make a binding decision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Parties reminder */}
          <div className="flex items-center justify-between text-xs bg-muted/50 rounded-xl px-3 py-2.5 gap-2 overflow-hidden">
            <span className="flex items-center gap-1.5 font-medium truncate min-w-0">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <span className="truncate">{dispute?.client?.name}</span>
            </span>
            <span className="text-muted-foreground shrink-0">vs</span>
            <span className="flex items-center gap-1.5 font-medium truncate min-w-0">
              <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
              <span className="truncate">{dispute?.freelancer?.name}</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Resolution Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={resolution}
              onValueChange={(v) => setResolution(v as DisputeResolution)}
            >
              <SelectTrigger className="rounded-xl h-10 text-sm">
                <SelectValue placeholder="Select a resolution..." />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      {opt.icon} {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Resolution Note (optional)
            </label>
            <Textarea
              placeholder="Explain the decision to both parties..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl resize-none text-sm min-h-[90px]"
            />
          </div>

          {resolution && (
            <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
              ⚠️ This action is <strong>irreversible</strong>. Both the client and
              freelancer will be notified immediately.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            disabled={!resolution || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="rounded-xl gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Gavel className="h-4 w-4" />
            )}
            Confirm Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DisputeManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DisputeStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Detail navigation
  const handleViewDetail = (d: Dispute) => {
    navigate(`/admin/disputes/${d.id}`);
  };

  // Resolve modal
  const [resolveTarget, setResolveTarget] = useState<Dispute | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: DisputeStatus;
    }) => updateDisputeStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Status updated to ${vars.status.replace(/_/g, " ")}`);
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["disputes", activeTab, search, typeFilter, page],
    queryFn: () =>
      getAllDisputes({
        status: activeTab === "ALL" ? "" : activeTab,
        type: (typeFilter as any) || "",
        search,
        page,
        limit: 12,
      }),
    staleTime: 30_000,
  });

  const stats = data?.stats;
  const disputes = data?.disputes ?? [];
  const pagination = data?.pagination;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Scale className="h-6 w-6 text-rose-500" />
              Dispute Resolution Centre
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review, mediate, and resolve conflicts between clients and freelancers.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-9 gap-2 font-semibold"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["disputes"] })}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* ── Stats Row ────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Open"
              value={stats.open}
              icon={AlertTriangle}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
              accent
            />
            <StatCard
              label="Under Review"
              value={stats.underReview}
              icon={Eye}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              label="Waiting"
              value={stats.waitingForResponse}
              icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
            />
            <StatCard
              label="Closed"
              value={stats.closed}
              icon={XCircle}
              iconBg="bg-zinc-100"
              iconColor="text-zinc-500"
            />
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────── */}
        <Card className="border border-border/50 rounded-2xl">
          <CardContent className="p-4 space-y-4">
            {/* Search + Type filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reason or description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 rounded-xl h-10 text-sm"
                />
              </div>
              <Select
                value={typeFilter || "ALL"}
                onValueChange={(v) => {
                  setTypeFilter(v === "ALL" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-52 rounded-xl h-10 text-sm gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {Object.entries(DISPUTE_TYPE_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.emoji} {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.key === "ALL"
                    ? Object.values(stats || {}).reduce((a, b) => a + b, 0)
                    : stats?.[tab.key.toLowerCase() as keyof DisputeStats];
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                      activeTab === tab.key
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {count !== undefined && count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center",
                          activeTab === tab.key
                            ? "bg-background/20 text-background"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Content Area ─────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading disputes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-sm font-medium text-muted-foreground">
              Failed to load disputes
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["disputes"] })}
            >
              Retry
            </Button>
          </div>
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
              <Scale className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">No disputes found</p>
            <p className="text-xs text-muted-foreground">
              {activeTab === "ALL"
                ? "No disputes have been raised yet."
                : `No ${activeTab.replace(/_/g, " ").toLowerCase()} disputes.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {disputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  onView={handleViewDetail}
                  onChangeStatus={(d, status) => {
                    statusMutation.mutate({ id: d.id, status });
                  }}
                  onResolve={(d) => {
                    setResolveTarget(d);
                    setResolveOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  Page {page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 text-xs"
                  disabled={page * pagination.limit >= pagination.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      <ResolveModal
        dispute={resolveTarget}
        open={resolveOpen}
        onClose={() => {
          setResolveOpen(false);
          setResolveTarget(null);
        }}
      />
    </DashboardLayout>
  );
}
