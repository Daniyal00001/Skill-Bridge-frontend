import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Send, Plus, Trash2, Milestone, UploadCloud, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  budget: number | null;
}

interface MilestoneInput {
  title: string;
  amount: string;
  description: string;
  dueDate: string;
  revisionsAllowed: number;
}

interface InviteFreelancerModalProps {
  freelancerId: string;
  freelancerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteFreelancerModal({
  freelancerId,
  freelancerName,
  isOpen,
  onClose,
  onSuccess,
}: InviteFreelancerModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New fields for direct invite terms
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [revisionsAllowed, setRevisionsAllowed] = useState<number>(3);
  const [files, setFiles] = useState<File[]>([]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    if (isOpen) {
      const fetchMyProjects = async () => {
        setFetchingProjects(true);
        try {
          const res = await api.get("/projects/client/my?status=OPEN");
          const projectsData = res.data?.projects || [];
          setProjects(projectsData);
          if (projectsData.length > 0) {
            setSelectedProjectId(projectsData[0].id);
          }
        } catch (err) {
          console.error("Failed to fetch projects", err);
          toast.error("Could not load your projects");
        } finally {
          setFetchingProjects(false);
        }
      };
      fetchMyProjects();
      
      // Reset form
      setMessage("");
      setMilestones([]);
      setRevisionsAllowed(3);
      setFiles([]);
    }
  }, [isOpen]);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", amount: "", description: "", dueDate: "", revisionsAllowed: 3 },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneInput,
    value: string | number
  ) => {
    const newMilestones = [...milestones];
    (newMilestones[index] as any)[field] = value;
    setMilestones(newMilestones);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const totalMilestoneBudget = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const handleInvite = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    const projectBudget = selectedProject?.budget || 0;

    // Validate if milestones sum up to project budget
    if (milestones.length > 0) {
      if (Math.abs(totalMilestoneBudget - projectBudget) > 0.01) {
        toast.error(`Total milestone amount ($${totalMilestoneBudget}) must equal project budget ($${projectBudget})`);
        return;
      }

      // Validate milestone fields
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (!m.title.trim()) {
          toast.error(`Milestone ${i + 1} is missing a title`);
          return;
        }
        if (!m.amount || parseFloat(m.amount) <= 0) {
          toast.error(`Milestone ${i + 1} requires a valid amount`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", selectedProjectId);
      formData.append("message", message);
      formData.append("milestones", JSON.stringify(milestones));
      formData.append("revisionsAllowed", (milestones.length > 0 ? 0 : revisionsAllowed).toString());
      // Always send project budget if no milestones, or totalMilestoneBudget if milestones (they should match)
      formData.append("budget", (milestones.length > 0 ? totalMilestoneBudget : projectBudget).toString());
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/freelancers/${freelancerId}/invite`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success(`Invitation sent to ${freelancerName}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to send invitation";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-none bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="space-y-2 p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-2xl font-black tracking-tight">
            Invite{" "}
            <span className="text-primary italic">{freelancerName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Define the project terms, milestones, and budget for this direct
            invitation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Project Selection & Global Revisions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Active Project {selectedProject?.budget && <span className="text-primary ml-1">(Budget: ${selectedProject.budget})</span>}
              </label>
              {fetchingProjects ? (
                <div className="h-12 flex items-center justify-center bg-accent/20 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : projects.length > 0 ? (
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger className="h-12 bg-background border-border/40 rounded-xl font-bold text-sm">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-xl max-h-48">
                    {projects.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        className="py-3 font-semibold"
                      >
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10 text-center">
                  <p className="text-xs font-bold text-destructive italic">
                    No open projects found. Please post a project first.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  milestones.length > 0 ? "text-muted-foreground/40" : "text-muted-foreground"
                )}>
                  Global Revisions Limit
                </label>
                {milestones.length > 0 && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter bg-amber-500/10 text-amber-700 border-amber-200">
                    Overridden by milestones
                  </Badge>
                )}
              </div>
              <Input
                type="number"
                min={0}
                max={20}
                disabled={milestones.length > 0}
                value={revisionsAllowed}
                onChange={(e) => setRevisionsAllowed(parseInt(e.target.value) || 0)}
                className={cn(
                  "h-12 bg-background border-border/40 rounded-xl font-bold text-sm transition-all",
                  milestones.length > 0 && "opacity-40 grayscale pointer-events-none"
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Invitation Message
            </label>
            <Textarea
              placeholder="Hi! I saw your profile and I think you'd be a great fit for this project..."
              className="min-h-[100px] bg-background border-border/40 rounded-xl p-4 text-sm font-medium resize-none focus-visible:ring-primary/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Paperclip className="w-3 h-3" /> Supporting Documents (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-primary/5 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold animate-in zoom-in-95">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border-dashed border-2 h-9 text-xs font-bold gap-2"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload File
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
            />
            <p className="text-[10px] text-muted-foreground italic">
              Share project briefs, design assets, or technical specs. Max 5 files.
            </p>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Milestone className="w-4 h-4 text-primary" />
                Project Milestones (Optional)
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  "font-bold px-3 py-1",
                  milestones.length > 0 && Math.abs(totalMilestoneBudget - (selectedProject?.budget || 0)) > 0.01 
                    ? "bg-destructive/10 text-destructive border-destructive/20" 
                    : "bg-primary/5 text-primary border-primary/20"
                )}>
                  {milestones.length > 0 ? `Total: $${totalMilestoneBudget}` : `Project Budget: $${selectedProject?.budget || 0}`}
                </Badge>
                {milestones.length > 0 && Math.abs(totalMilestoneBudget - (selectedProject?.budget || 0)) > 0.01 && (
                  <span className="text-[10px] font-bold text-destructive animate-pulse">
                    Must equal ${selectedProject?.budget}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-card border rounded-2xl space-y-4 relative group hover:border-primary/30 transition-colors shadow-sm"
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => handleRemoveMilestone(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12 lg:col-span-7 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Milestone Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                        placeholder="e.g. Initial Design Wireframes"
                        className="bg-background rounded-xl font-semibold"
                      />
                    </div>
                    <div className="md:col-span-6 lg:col-span-3 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Amount ($)</Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={milestone.amount}
                        onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)}
                        placeholder="0.00"
                        className="bg-background rounded-xl font-bold text-primary"
                      />
                    </div>
                    <div className="md:col-span-6 lg:col-span-2 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Revisions</Label>
                      <Input
                        type="number"
                        min="0"
                        value={milestone.revisionsAllowed}
                        onChange={(e) => handleMilestoneChange(idx, "revisionsAllowed", parseInt(e.target.value) || 0)}
                        className="bg-background rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Description</Label>
                      <Input
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                        placeholder="Describe deliverables..."
                        className="bg-background rounded-xl text-sm"
                      />
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Due Date</Label>
                      <Input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) => handleMilestoneChange(idx, "dueDate", e.target.value)}
                        className="bg-background rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {milestones.length === 0 && (
                <div className="p-8 border-2 border-dashed border-muted rounded-2xl text-center space-y-3 bg-muted/5">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-40">
                    <Milestone className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-muted-foreground">No milestones added yet</p>
                    <p className="text-[10px] text-muted-foreground/60 max-w-[250px] mx-auto italic">
                      The full project budget of ${selectedProject?.budget || 0} will be used for this invitation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleAddMilestone}
              className="w-full h-12 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project Milestone
            </Button>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/40 shrink-0 gap-3 sm:gap-0 bg-background/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || projects.length === 0 || (milestones.length > 0 && Math.abs(totalMilestoneBudget - (selectedProject?.budget || 0)) > 0.01)}
            className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Direct Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

