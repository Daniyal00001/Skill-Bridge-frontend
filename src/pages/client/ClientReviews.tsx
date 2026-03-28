import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Star, Loader2, Inbox, ListFilter, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  projectId?: string;
  contractId: string;
  submittedAt: string;
  revealedAt?: string;
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const wh = size === "md" ? "w-4 h-4" : "w-3 h-3";
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

const ClientReviewsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"given" | "received">("received");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [givenReviews, setGivenReviews] = useState<ReviewItem[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [receivedStats, setReceivedStats] = useState<{ averageRating: number | null; totalReviews: number; ratingBreakdown: Record<number, number> }>({
    averageRating: null, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [givenRes, receivedRes] = await Promise.all([
          api.get("/reviews/my-given"),
          api.get("/reviews/my-received"),
        ]);
        setGivenReviews(givenRes.data.reviews || []);
        setReceivedReviews(receivedRes.data.reviews || []);
        setReceivedStats({
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

  const filteredReviews = useMemo(() => {
    const base = tab === "given" ? givenReviews : receivedReviews;
    return base.filter((r) => {
      const matchesRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
      const searchTarget = (tab === "given" ? r.receiverName : r.giverName) || "";
      const matchesSearch = 
        searchTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRating && matchesSearch;
    });
  }, [tab, givenReviews, receivedReviews, ratingFilter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Feedback</p>
          <h1 className="text-2xl font-black tracking-tight">My Reviews</h1>
        </div>

        {/* Rating summary (Screenshot Style - Vertical Breakdown) */}
        {!loading && receivedStats.totalReviews > 0 && (
          <div className="flex flex-col sm:flex-row gap-8 items-center p-6 rounded-2xl bg-muted/10 border border-border/20 shadow-sm overflow-hidden">
            {/* Left part: Rating Box */}
            <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-2xl px-8 py-6 shrink-0 min-w-[160px]">
              <div className="text-5xl font-black text-amber-500 mb-1">
                {receivedStats.averageRating?.toFixed(1) || "0.0"}
              </div>
              <StarDisplay rating={Math.round(receivedStats.averageRating || 0)} size="md" />
              <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mt-3">
                {receivedStats.totalReviews} REVIEWS
              </div>
            </div>

            {/* Right part: Vertical Star Breakdown */}
            <div className="flex-1 flex flex-col gap-2 w-full max-w-[300px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = receivedStats.ratingBreakdown?.[star] || 0;
                const pct = receivedStats.totalReviews > 0 ? (count / receivedStats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 w-full">
                    <div className="text-xs font-bold text-muted-foreground w-6 whitespace-nowrap">
                      {star}★
                    </div>
                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full relative overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-700" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-muted-foreground/40 w-6 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Controls: Search + Tabs + Rating filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-1 p-1 bg-muted/40 rounded-xl border border-border/20">
              {(["received", "given"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setRatingFilter("all"); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                    tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "received" ? `Received (${receivedReviews.length})` : `Given (${givenReviews.length})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-9 h-9 text-xs font-bold rounded-xl bg-muted/20 border-border/20 focus:bg-background transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-[110px] h-9 text-xs font-bold rounded-xl bg-muted/20 border-border/20 shadow-none focus:ring-0">
                    <SelectValue placeholder="All Stars" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 shadow-xl">
                    <SelectItem value="all" className="text-xs font-bold">All Stars</SelectItem>
                    {[5, 4, 3, 2, 1].map((s) => (
                      <SelectItem key={s} value={String(s)} className="text-xs font-bold">{s} Stars</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Reviews...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-muted/5 border border-dashed border-border/40 rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground/30">
              <Inbox className="w-7 h-7" />
            </div>
            <div>
              <p className="font-black text-sm text-foreground">No matches found</p>
              <p className="text-[10px] text-muted-foreground max-w-[240px] mx-auto mt-1 leading-relaxed uppercase font-bold tracking-tight">
                Try adjusting your search or filters to see more results.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="rounded-2xl border-border/30 hover:border-primary/20 hover:shadow-md transition-all duration-300 group overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-border/30">
                        <AvatarImage src={tab === "given" ? review.receiverImage : review.giverImage} />
                        <AvatarFallback className="font-black text-xs">
                          {(tab === "given" ? review.receiverName : review.giverName)?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm">
                          {tab === "given" ? review.receiverName : review.giverName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          {tab === "given" ? "Freelancer" : (review.giverRole === "CLIENT" ? "Client" : "Freelancer")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarDisplay rating={review.rating} />
                      <p className="text-[10px] text-muted-foreground font-bold mt-1.5 flex items-center justify-end gap-1 px-1.5 py-0.5 rounded-full bg-muted/40">
                        {new Date(review.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="px-1 space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Project</p>
                    {review.projectId ? (
                      <Link 
                        to={`/client/projects/${review.projectId}`}
                        className="text-[13px] font-bold text-foreground/80 hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 line-clamp-1"
                      >
                        {review.projectTitle}
                      </Link>
                    ) : (
                      <p className="text-[13px] font-bold text-foreground/80 line-clamp-1">{review.projectTitle}</p>
                    )}
                  </div>

                  {review.comment && (
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/10">
                      <p className="text-xs text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
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

export default ClientReviewsPage;


