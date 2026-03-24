import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Zap,
  Loader2,
  CheckCircle2,
  Briefcase,
  Calendar,
  UploadCloud,
  FileText,
  X,
  Plus,
  Trash2,
  ListChecks,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  allowedRevisions: string;
}

export default function FreelancerSubmitProposal() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [bid, setBid] = useState<number>(0);
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [generalRevisionLimit, setGeneralRevisionLimit] = useState("3");
  const [coverLetter, setCoverLetter] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Milestone state
  const [milestonesEnabled, setMilestonesEnabled] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", description: "", amount: "", dueDate: "", allowedRevisions: "3" },
  ]);
  const [milestonesSectionOpen, setMilestonesSectionOpen] = useState(false);

  const tempDiv =
    typeof document !== "undefined" ? document.createElement("div") : null;
  const getCoverLetterTextLength = (html: string) => {
    if (!tempDiv) return 0;
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  };
  const coverLetterTextLength = getCoverLetterTextLength(coverLetter);

  const [tokenInfo, setTokenInfo] = useState<{
    tokenCost: number;
    currentBalance: number;
    canAfford: boolean;
    breakdown: any;
  } | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Check if they already applied
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProject(true);
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.project);
        if (res.data.project?.budget) {
          setBid(res.data.project.budget);
        }

        // Check for existing proposal
        const myRes = await api.get("/proposals/my");
        const existing = myRes.data.proposals?.find(
          (p: any) => p.project?.id === projectId || p.projectId === projectId,
        );
        if (existing) setAlreadyApplied(true);
      } catch (err) {
        toast.error("Failed to load project details");
        navigate("/freelancer/browse");
      } finally {
        setLoadingProject(false);
      }
    };
    fetchData();
  }, [projectId, navigate]);

  useEffect(() => {
    const fetchTokenCost = async () => {
      if (!projectId) return;
      try {
        const res = await api.get(`/proposals/project/${projectId}/token-cost`);
        setTokenInfo(res.data);
      } catch {
        // non-fatal
      } finally {
        setTokenLoading(false);
      }
    };
    fetchTokenCost();
  }, [projectId]);

  const fee = Math.round(bid * 0.1);
  const total = bid - fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyApplied) {
      toast.error("You have already applied to this project!");
      return;
    }
    if (coverLetter.length < 50) {
      toast.error("Cover letter too short!", {
        description: "Write at least 50 characters about your approach.",
      });
      return;
    }
    if (!bid || bid <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    if (tokenInfo && !tokenInfo.canAfford) {
      toast.error("Insufficient SkillTokens", {
        description: `You need ${tokenInfo.tokenCost} tokens but only have ${tokenInfo.currentBalance}.`,
      });
      return;
    }

    // Milestone validation
    if (milestonesEnabled) {
      for (const m of milestones) {
        if (!m.title.trim() || !m.amount) {
          toast.error("Each milestone needs a title and amount.");
          return;
        }
        if (Number(m.amount) <= 0) {
          toast.error("Milestone amounts must be greater than 0.");
          return;
        }
      }
      const milestoneTotal = milestones.reduce(
        (s, m) => s + Number(m.amount),
        0,
      );
      if (Math.abs(milestoneTotal - bid) > 0.01) {
        toast.error("Milestone amounts must add up to your bid amount.", {
          description: `Total milestones: $${milestoneTotal.toFixed(2)} vs Bid: $${bid.toFixed(2)}`,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bidAmount", String(bid));
      formData.append("deliveryDays", String(deliveryDays));
      formData.append("generalRevisionLimit", generalRevisionLimit);
      formData.append("coverLetter", coverLetter);

      if (milestonesEnabled) {
        formData.append(
          "milestones",
          JSON.stringify(
            milestones.map((m, i) => ({
              title: m.title,
              description: m.description || undefined,
              amount: Number(m.amount),
              dueDate: m.dueDate || undefined,
              allowedRevisions: Number(m.allowedRevisions),
              order: i,
            })),
          ),
        );
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/proposals/project/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Proposal submitted! 🎉", {
        description: `Your $${bid.toLocaleString()} bid is live. ${tokenInfo?.tokenCost || 0} SkillTokens deducted.`,
      });
      navigate(`/freelancer/projects/${projectId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const addMilestone = () =>
    setMilestones((prev) => [
      ...prev,
      { title: "", description: "", amount: "", dueDate: "", allowedRevisions: "3" },
    ]);

  const removeMilestone = (idx: number) =>
    setMilestones((prev) => prev.filter((_, i) => i !== idx));

  const updateMilestone = (
    idx: number,
    field: keyof MilestoneInput,
    value: string,
  ) =>
    setMilestones((prev) =>
      prev.map((m, i) =>
        i === idx
          ? {
              ...m,
              [field]:
                field === "amount"
                  ? value === ""
                    ? ""
                    : String(Math.max(0, Number(value)))
                  : value,
            }
          : m,
      ),
    );

  if (loadingProject) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Preparing proposal...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  const canAfford = tokenInfo ? tokenInfo.canAfford : true;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="w-12 h-12 p-0 rounded-2xl bg-muted/30 hover:bg-muted"
            onClick={() => navigate(`/freelancer/projects/${projectId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Submit Proposal
            </h1>
            <p className="text-muted-foreground font-medium tracking-wide mt-1">
              Craft a compelling proposal to win this project
            </p>
          </div>
        </div>

        {alreadyApplied ? (
          <Card className="bg-emerald-500/10 border-emerald-500/30 rounded-[2.5rem] p-10 text-center shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-2">
              You've already applied!
            </h2>
            <p className="text-emerald-600/80 dark:text-emerald-400/80 font-medium mb-8">
              Your proposal is under review by the client. Good luck!
            </p>
            <Button
              size="lg"
              className="rounded-xl font-bold px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => navigate(`/freelancer/projects/${projectId}`)}
            >
              Back to Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: The Form */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <Card className="bg-card/40 backdrop-blur-2xl border-border/40 rounded-[2.5rem] shadow-2xl p-8 border-t-8 border-t-primary">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Bid Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                      <div className="w-1 h-6 bg-primary rounded-full" /> Terms
                      & Payment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Your Bid Amount
                        </Label>
                        <div className="relative group">
                          <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            type="number"
                            value={bid}
                            onChange={(e) => setBid(Number(e.target.value))}
                            placeholder={`Budget: $${project.budget?.toLocaleString()}`}
                            className="pl-14 h-16 bg-background/50 border-border/40 rounded-2xl font-black text-xl hover:border-primary/30 transition-colors focus:border-primary"
                          />
                        </div>

                        <div className="bg-muted/30 p-5 rounded-2xl border border-border/40 space-y-3">
                          <div className="flex justify-between text-xs font-bold text-muted-foreground">
                            <span>Platform Fee (10%)</span>
                            <span>-${fee.toLocaleString()}</span>
                          </div>
                          <Separator className="bg-border/20" />
                          <div className="flex justify-between text-base font-black text-foreground">
                            <span>You Receive</span>
                            <span className="text-emerald-500">
                              ${total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Estimated Delivery
                        </Label>
                        <Select
                          value={deliveryDays}
                          onValueChange={setDeliveryDays}
                        >
                          <SelectTrigger className="h-16 px-6 bg-background/50 border-border/40 rounded-2xl font-black text-lg hover:border-primary/30 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border/40">
                            {[
                              { label: "Less than 1 week", value: "5" },
                              { label: "1 Week", value: "7" },
                              { label: "2 Weeks", value: "14" },
                              { label: "1 Month", value: "30" },
                              { label: "2 Months", value: "60" },
                              { label: "3+ Months", value: "90" },
                            ].map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="font-bold py-3 cursor-pointer"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground font-medium px-2">
                          Be realistic. Clients appreciate honest timelines.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Revision Limit (Overall)
                        </Label>
                        <Select
                          value={generalRevisionLimit}
                          onValueChange={setGeneralRevisionLimit}
                          disabled={milestonesEnabled}
                        >
                          <SelectTrigger className={cn(
                            "h-16 px-6 bg-background/50 border-border/40 rounded-2xl font-black text-lg hover:border-primary/30 transition-colors",
                            milestonesEnabled && "opacity-50 cursor-not-allowed bg-muted"
                          )}>
                            <SelectValue placeholder="Select revisions" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border/40">
                            <SelectItem value="1" className="font-bold py-3">1 Revision</SelectItem>
                            <SelectItem value="2" className="font-bold py-3">2 Revisions</SelectItem>
                            <SelectItem value="3" className="font-bold py-3">3 Revisions (Standard)</SelectItem>
                            <SelectItem value="5" className="font-bold py-3">5 Revisions</SelectItem>
                            <SelectItem value="10" className="font-bold py-3">10 Revisions</SelectItem>
                            <SelectItem value="-1" className="font-bold py-3">Unlimited Revisions</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground font-medium px-2">
                          {milestonesEnabled 
                            ? "Disabled: Milestones have individual revision limits." 
                            : "Total revisions allowed for this project."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Cover Letter */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full" />{" "}
                        Cover Letter
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          coverLetterTextLength < 50
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500",
                        )}
                      >
                        {coverLetterTextLength} / 2000
                      </span>
                    </div>
                    <RichTextEditor
                      value={coverLetter}
                      onChange={(value) => {
                        // For validation, we might want to check text length
                        const tempDiv = document.createElement("div");
                        tempDiv.innerHTML = value;
                        const textLength = tempDiv.textContent?.length || 0;

                        if (textLength <= 2000) {
                          setCoverLetter(value);
                        }
                      }}
                      placeholder="Introduce yourself, explain why you're a great fit for this project, and outline your approach..."
                    />
                    {(() => {
                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = coverLetter;
                      const textLength = tempDiv.textContent?.length || 0;
                      if (textLength < 50 && textLength > 0) {
                        return (
                          <p className="text-xs font-bold text-amber-500 px-2 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Please write at least 50 characters to submit a
                            competitive proposal.
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <Separator className="bg-border/40" />

                  {/* Milestone Plan */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full" />{" "}
                        Milestone Plan
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1 rounded-full ml-2">
                          Optional
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setMilestonesEnabled(!milestonesEnabled);
                          setMilestonesSectionOpen(!milestonesEnabled);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all border-2",
                          milestonesEnabled
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted",
                        )}
                      >
                        <ListChecks className="w-4 h-4" />
                        {milestonesEnabled ? "Milestones On" : "Add Milestones"}
                        {milestonesEnabled ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {milestonesEnabled && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                          <p className="text-xs font-bold text-blue-600">
                            💡 Milestone amounts must add up to your total bid
                            of <strong>${bid.toLocaleString()}</strong>. Both
                            parties must agree on milestones before work begins.
                          </p>
                        </div>

                        {milestones.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-5 bg-muted/20 rounded-2xl border border-border/30 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                                Milestone {idx + 1}
                              </span>
                              {milestones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeMilestone(idx)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Title *
                                </Label>
                                <Input
                                  value={m.title}
                                  onChange={(e) =>
                                    updateMilestone(
                                      idx,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Initial Design Mockups"
                                  className="h-11 rounded-xl bg-background/60"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Amount ($) *
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="0"
                                    value={m.amount}
                                    onChange={(e) =>
                                      updateMilestone(
                                        idx,
                                        "amount",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="500"
                                    className="h-11 pl-9 rounded-xl bg-background/60"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Description
                                </Label>
                                <Textarea
                                  value={m.description}
                                  onChange={(e) =>
                                    updateMilestone(
                                      idx,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  placeholder="What will be delivered?"
                                  className="rounded-xl bg-background/60 p-3 resize-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Due Date (Optional)
                                </Label>
                                <Input
                                  type="date"
                                  value={m.dueDate}
                                  onChange={(e) =>
                                    updateMilestone(
                                      idx,
                                      "dueDate",
                                      e.target.value,
                                    )
                                  }
                                  className="h-11 rounded-xl bg-background/60"
                                />
                              </div>
                            </div>

                            <div className="space-y-2 pt-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Milestone Revision Limit
                              </Label>
                              <Select
                                value={m.allowedRevisions}
                                onValueChange={(val) =>
                                  updateMilestone(idx, "allowedRevisions", val)
                                }
                              >
                                <SelectTrigger className="h-11 rounded-xl bg-background/60 w-full md:w-1/2">
                                  <SelectValue placeholder="Select revisions" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/40">
                                  <SelectItem value="1">1 Revision</SelectItem>
                                  <SelectItem value="2">2 Revisions</SelectItem>
                                  <SelectItem value="3">3 Revisions (Standard)</SelectItem>
                                  <SelectItem value="5">5 Revisions</SelectItem>
                                  <SelectItem value="10">10 Revisions</SelectItem>
                                  <SelectItem value="-1">Unlimited Revisions</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                Revisions allowed specifically for this milestone.
                              </p>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={addMilestone}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-primary hover:bg-primary/10 transition-colors border-2 border-primary/20"
                          >
                            <Plus className="w-4 h-4" /> Add Another Milestone
                          </button>
                          <div className="text-sm font-black">
                            Total:{" "}
                            <span
                              className={cn(
                                milestones.reduce(
                                  (s, m) => s + Number(m.amount || 0),
                                  0,
                                ) === bid
                                  ? "text-emerald-600"
                                  : "text-red-500",
                              )}
                            >
                              $
                              {milestones
                                .reduce((s, m) => s + Number(m.amount || 0), 0)
                                .toLocaleString()}
                            </span>{" "}
                            / ${bid.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/40" />
                  <div className="space-y-6">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                      <div className="w-1 h-6 bg-primary rounded-full" />{" "}
                      Attachments
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-auto bg-muted/50 px-3 py-1 rounded-full">
                        Optional • Max 5 files
                      </span>
                    </h3>

                    <div className="border-2 border-dashed border-border/40 rounded-[2rem] p-10 text-center hover:bg-primary/5 transition-all group relative overflow-hidden">
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.zip"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          if (!e.target.files) return;
                          const ALLOWED = [
                            "image/jpeg",
                            "image/png",
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "text/plain",
                            "application/zip",
                            "application/x-zip-compressed",
                          ];
                          const selected = Array.from(e.target.files);

                          const valid = selected.filter((f) =>
                            ALLOWED.includes(f.type),
                          );
                          const invalid = selected.filter(
                            (f) => !ALLOWED.includes(f.type),
                          );

                          if (invalid.length > 0) {
                            toast.error(`${invalid.length} file(s) skipped`, {
                              description: "Only JPG, PNG, PDF, Word, TXT, and ZIP are allowed.",
                            });
                          }

                          if (files.length + valid.length > 5) {
                            toast.warning("Limit reached", {
                              description: "You can only attach up to 5 files.",
                            });
                            return;
                          }

                          if (valid.length > 0) {
                            setFiles([...files, ...valid]);
                          }
                          e.target.value = "";
                        }}
                      />
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-black text-foreground">
                            Click or drag to upload documents
                          </p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">
                            Support for PDF, JPG, PNG, Word, TXT, ZIP (Max 10MB per file)
                          </p>
                        </div>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.map((file, i) => (
                          <div
                            key={i}
                            className="bg-background/50 border border-border/40 p-4 rounded-2xl flex items-center gap-4 group animate-in zoom-in-95 duration-200"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              onClick={() =>
                                setFiles(files.filter((_, idx) => idx !== i))
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Area */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={
                        submitting ||
                        coverLetterTextLength < 50 ||
                        !canAfford ||
                        !bid
                      }
                      className="w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] shadow-xl hover:shadow-primary/25 transition-all text-white disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-3" />
                          Sending Proposal...
                        </>
                      ) : (
                        "Submit Proposal Now"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right: Project Summary & Token Cost */}
            <div className="lg:col-span-4 space-y-8">
              {/* Token Cost Card */}
              <Card
                className={cn(
                  "rounded-[2.5rem] border p-8 shadow-lg transition-colors border-t-4",
                  tokenLoading
                    ? "bg-card/40 border-border/40"
                    : canAfford
                      ? "bg-amber-500/5 border-amber-500/20 border-t-amber-500"
                      : "bg-red-500/5 border-red-500/30 border-t-red-500",
                )}
              >
                <h3 className="font-black tracking-tight mb-6 flex items-center gap-2 text-lg">
                  <Zap
                    className={cn(
                      "w-5 h-5",
                      canAfford ? "text-amber-500" : "text-red-500",
                    )}
                  />
                  SkillTokens Required
                </h3>

                {tokenLoading ? (
                  <div className="flex flex-col items-center justify-center p-6 gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-bold">
                      Calculating cost...
                    </span>
                  </div>
                ) : tokenInfo ? (
                  <div className="space-y-6">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Cost to Apply
                      </span>
                      <span
                        className={cn(
                          "text-5xl font-black tracking-tighter leading-none",
                          canAfford ? "text-amber-500" : "text-red-500",
                        )}
                      >
                        {tokenInfo.tokenCost}
                      </span>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-border/40">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-muted-foreground tracking-wide">
                          Your Balance
                        </span>
                        <span
                          className={cn(
                            "font-black text-lg",
                            canAfford ? "text-emerald-500" : "text-red-500",
                          )}
                        >
                          {tokenInfo.currentBalance}
                        </span>
                      </div>

                      {!canAfford && (
                        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 mt-4">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 leading-relaxed">
                            You need{" "}
                            {tokenInfo.tokenCost - tokenInfo.currentBalance}{" "}
                            more tokens to apply.
                          </p>
                          <Button
                            asChild
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            <Link to="/freelancer/tokens">Get SkillTokens</Link>
                          </Button>
                        </div>
                      )}

                      {canAfford && (
                        <p className="text-xs font-bold text-muted-foreground/60 text-right">
                          Remaining after:{" "}
                          {tokenInfo.currentBalance - tokenInfo.tokenCost}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </Card>

              {/* Project Snippet */}
              <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="font-black tracking-tight mb-6 text-lg">
                  Project Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-black text-foreground line-clamp-2 leading-snug mb-2">
                      {project.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-3">
                      {project.shortDesc || project.description}
                    </p>
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" /> Budget
                      </div>
                      <div className="font-bold text-sm">
                        ${project.budget?.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3" /> Size
                      </div>
                      <div className="font-bold text-sm">
                        {project.size || project.projectSize || "N/A"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Created
                      </div>
                      <div className="font-bold text-sm">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="link"
                    className="p-0 h-auto font-bold text-primary hover:text-primary/80"
                    onClick={() =>
                      navigate(`/freelancer/projects/${projectId}`)
                    }
                  >
                    View Full Details →
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
