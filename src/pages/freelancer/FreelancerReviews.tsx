import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, Inbox, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  giverName?: string;
  giverImage?: string;
  receiverName?: string;
  receiverImage?: string;
  giverRole?: string;
  projectTitle: string;
  contractId: string;
  submittedAt: string;
  revealedAt?: string;
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const wh = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(wh, s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")}
        />
      ))}
    </div>
  );
}

const FreelancerReviewsPage = () => {
  const [tab, setTab] = useState<"received" | "given">("received");
  const [givenReviews, setGivenReviews] = useState<ReviewItem[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number | null;
    totalReviews: number;
    ratingBreakdown: Record<number, number>;
  }>({ averageRating: null, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [receivedRes, givenRes] = await Promise.all([
          api.get("/reviews/my-received"),
          api.get("/reviews/my-given"),
        ]);
        setReceivedReviews(receivedRes.data.reviews || []);
        setGivenReviews(givenRes.data.reviews || []);
        setStats({
          averageRating: receivedRes.data.averageRating,
          totalReviews: receivedRes.data.totalReviews,
          ratingBreakdown: receivedRes.data.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeReviews = tab === "given" ? givenReviews : receivedReviews;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Reputation</p>
          <h1 className="text-3xl font-black tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground text-sm">Your client feedback and overall rating history.</p>
        </div>

        {/* Rating Summary Card */}
        {!loading && stats.totalReviews > 0 && (
          <Card className="rounded-2xl border-border/40 overflow-hidden bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avg score */}
                <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-400/20 shrink-0">
                  <div className="text-5xl font-black text-yellow-500">
                    {stats.averageRating?.toFixed(1) || "—"}
                  </div>
                  <StarDisplay rating={Math.round(stats.averageRating || 0)} size="md" />
                  <p className="text-xs text-muted-foreground font-bold">{stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}</p>
                </div>

                {/* Breakdown */}
                <div className="flex-1 w-full space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Rating Breakdown</p>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingBreakdown?.[star] || 0;
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="w-3 text-muted-foreground font-bold text-xs">{star}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-5 text-xs text-muted-foreground text-right">{count}</span>
                        <span className="w-8 text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/20 w-fit">
          {(["received", "given"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-black transition-all",
                tab === t
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "received"
                ? `Received (${receivedReviews.length})`
                : `Given (${givenReviews.length})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        ) : activeReviews.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-black text-lg text-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              {tab === "received"
                ? "Complete projects and receive reviews from clients to build your reputation."
                : "Reviews you've left for clients will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {activeReviews.map((review) => (
              <Card
                key={review.id}
                className="rounded-2xl border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-border/30">
                        <AvatarImage src={tab === "given" ? review.receiverImage : review.giverImage} />
                        <AvatarFallback className="font-black text-sm">
                          {(tab === "given" ? review.receiverName : review.giverName)?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm">
                          {tab === "given" ? review.receiverName : review.giverName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tab === "given"
                            ? "Client"
                            : review.giverRole === "CLIENT" ? "Client" : "Freelancer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarDisplay rating={review.rating} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.submittedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="px-0.5">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Project</p>
                    <p className="text-sm font-bold text-foreground/80">{review.projectTitle}</p>
                  </div>

                  {review.comment && (
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/10">
                      <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FreelancerReviewsPage;
