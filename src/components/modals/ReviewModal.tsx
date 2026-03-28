import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  projectTitle: string;
  revieweeRole: "CLIENT" | "FREELANCER"; // who you're reviewing
  onSuccess?: () => void;
}

export function ReviewModal({
  open,
  onClose,
  contractId,
  projectTitle,
  revieweeRole,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const displayRating = hovered || rating;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/reviews", {
        contractId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(
        res.data.reviewStatus === "BOTH_REVEALED"
          ? "Both reviews submitted! Check each other's feedback."
          : "Review submitted! Waiting for the other party."
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Leave a Review
          </DialogTitle>
          <DialogDescription className="text-sm">
            Review your{" "}
            <span className="font-semibold">
              {revieweeRole === "CLIENT" ? "client" : "freelancer"}
            </span>{" "}
            for{" "}
            <span className="font-semibold italic">"{projectTitle}"</span>.
            Your review is hidden until both parties submit — or 7 days pass.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Star Picker */}
          <div className="flex flex-col items-center gap-3 py-4 rounded-2xl bg-muted/30 border border-border/30">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Select Rating
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors duration-150",
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p
                className={cn(
                  "text-sm font-black animate-in fade-in duration-200",
                  displayRating >= 5
                    ? "text-emerald-600"
                    : displayRating >= 4
                    ? "text-blue-600"
                    : displayRating >= 3
                    ? "text-amber-600"
                    : "text-red-500"
                )}
              >
                {ratingLabels[displayRating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Comment{" "}
              <span className="font-normal normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <Textarea
              placeholder={`Describe your experience working with this ${revieweeRole === "CLIENT" ? "client" : "freelancer"}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              className="rounded-xl resize-none text-sm"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Be honest and constructive.</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* Blind review notice */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-400/20 text-xs text-blue-700 dark:text-blue-400 font-medium">
            Your review is sealed until the other party submits theirs — or
            after 7 days, whichever comes first.
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl font-black gap-2 bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
