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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Send, UploadCloud, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MilestoneEditor, MilestoneInput } from "@/components/contracts/MilestoneEditor";

interface Project {
  id: string;
  title: string;
  budget: number | null;
}

interface SendContractModalProps {
  freelancerId: string;
  freelancerName: string;
  projectId?: string; // Pre-selected project ID from chat room
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendContractModal({
  freelancerId,
  freelancerName,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: SendContractModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          
          // If we have a projectId from props, use it. Otherwise use the first one available.
          if (projectId) {
            setSelectedProjectId(projectId);
          } else if (projectsData.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projectsData[0].id);
          }
        } catch (err) {
          console.error("Failed to fetch projects", err);
        } finally {
          setFetchingProjects(false);
        }
      };
      fetchMyProjects();
      
      // Reset form (except projectId)
      setMessage("");
      setMilestones([]);
      setRevisionsAllowed(3);
      setFiles([]);
    }
  }, [isOpen, projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check for 10MB limit
      const oversized = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversized.length > 0) {
        toast.error("Some files exceed the 10MB limit.");
        return;
      }

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

  const handleSendContract = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    const projectBudget = selectedProject?.budget || 0;

    if (milestones.length > 0) {
      if (Math.abs(totalMilestoneBudget - projectBudget) > 0.01) {
        toast.error(`Total milestone amount ($${totalMilestoneBudget}) must equal project budget ($${projectBudget})`);
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", selectedProjectId);
      formData.append("message", message);
      formData.append("milestones", JSON.stringify(milestones));
      formData.append("revisionsAllowed", (milestones.length > 0 ? 0 : revisionsAllowed).toString());
      formData.append("budget", (milestones.length > 0 ? totalMilestoneBudget : projectBudget).toString());
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/freelancers/${freelancerId}/invite`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success(`Contract invitation sent to ${freelancerName}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-none bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="space-y-2 p-6 pb-4 border-b border-border/40 shrink-0">
          <DialogTitle className="text-2xl font-black tracking-tight">
            Send Contract to{" "}
            <span className="text-primary italic">{freelancerName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Formalize your agreement by defining milestones and revisions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Project Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Target Project {selectedProject?.budget && <span className="text-primary ml-1">(Budget: ${selectedProject.budget})</span>}
            </label>
            {fetchingProjects ? (
              <div className="h-12 flex items-center justify-center bg-accent/20 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : projects.length > 0 ? (
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                disabled={!!projectId} // Lock if coming from a specific project chat
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
                  No open projects found.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Personal Message (Optional)
            </label>
            <Textarea
              placeholder="Add any specific details or notes about this contract..."
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
          </div>

          {/* Milestones & Revisions */}
          <MilestoneEditor 
            milestones={milestones}
            setMilestones={setMilestones}
            projectBudget={selectedProject?.budget || 0}
            revisionsAllowed={revisionsAllowed}
            setRevisionsAllowed={setRevisionsAllowed}
          />
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
            onClick={handleSendContract}
            disabled={loading || projects.length === 0 || (milestones.length > 0 && Math.abs(totalMilestoneBudget - (selectedProject?.budget || 0)) > 0.01)}
            className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
