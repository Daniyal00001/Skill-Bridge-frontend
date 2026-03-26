import { Milestone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MilestoneInput {
  title: string;
  amount: string;
  description: string;
  dueDate: string;
  revisionsAllowed: number;
}

interface MilestoneEditorProps {
  milestones: MilestoneInput[];
  setMilestones: (milestones: MilestoneInput[]) => void;
  projectBudget: number;
  revisionsAllowed: number;
  setRevisionsAllowed: (val: number) => void;
}

export function MilestoneEditor({
  milestones,
  setMilestones,
  projectBudget,
  revisionsAllowed,
  setRevisionsAllowed,
}: MilestoneEditorProps) {
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

  const totalMilestoneBudget = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const budgetMismatch = milestones.length > 0 && Math.abs(totalMilestoneBudget - projectBudget) > 0.01;

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Milestone className="w-4 h-4 text-primary" />
            Project Milestones (Optional)
          </label>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              "font-bold px-3 py-1",
              budgetMismatch 
                ? "bg-destructive/10 text-destructive border-destructive/20" 
                : "bg-primary/5 text-primary border-primary/20"
            )}>
              {milestones.length > 0 ? `Total: $${totalMilestoneBudget}` : `Project Budget: $${projectBudget}`}
            </Badge>
            {budgetMismatch && (
              <span className="text-[10px] font-bold text-destructive animate-pulse">
                Must equal ${projectBudget}
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
                  The full project budget of ${projectBudget} will be used for this invitation.
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
  );
}
