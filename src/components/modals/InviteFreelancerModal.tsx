import { useState, useEffect } from "react";
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
import { Loader2, Send } from "lucide-react";

interface Project {
  id: string;
  title: string;
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
    }
  }, [isOpen]);

  const handleInvite = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/freelancers/${freelancerId}/invite`, {
        projectId: selectedProjectId,
        message,
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
      <DialogContent className="sm:max-w-[500px] border-none bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-black tracking-tight">
            Recruit{" "}
            <span className="text-primary italic">{freelancerName}</span>
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            Select one of your active projects to send an invitation. A tailored
            message increases your success rate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Active Project
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
                <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-xl font-bold text-sm">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-xl">
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
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Invitation Message (Optional)
            </label>
            <Textarea
              placeholder="Hi! I saw your profile and I think you'd be a great fit for this project..."
              className="min-h-[120px] bg-background/50 border-border/40 rounded-2xl p-4 text-sm font-medium resize-none focus-visible:ring-primary/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || projects.length === 0}
            className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
