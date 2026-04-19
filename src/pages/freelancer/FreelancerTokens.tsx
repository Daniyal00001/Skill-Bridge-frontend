import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TokenPurchaseModal } from "@/components/modals/TokenPurchaseModal";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Zap,
  Sparkles,
  Info,
  Briefcase,
  Star,
  Users,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TokenTransaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  reason: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

const reasonLabels: Record<string, string> = {
  REGISTRATION_BONUS: "Welcome Bonus",
  PROPOSAL_SUBMITTED: "Proposal Submitted",
  PROPOSAL_WITHDRAWN: "Proposal Withdrawn (Refund)",
  ADMIN_GRANT: "Admin Grant",
  ADMIN_DEDUCT: "Admin Deduction",
  TOKEN_PURCHASE: "Token Purchase",
};

export default function FreelancerTokens() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moneyBalance, setMoneyBalance] = useState(0);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const fetchHistory = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/tokens/history?page=${pageNum}&limit=15`);
      setBalance(res.data.balance);
      setMoneyBalance(res.data.moneyBalance || 0);
      setTotalEarned(res.data.totalEarned);
      setTotalSpent(res.data.totalSpent);
      setTransactions(res.data.transactions || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load token history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Coins className="w-7 h-7 text-amber-500" />
              </div>
              SkillTokens
            </h1>
            <p className="text-muted-foreground text-base mt-1">
              Your token wallet — spend tokens to submit proposals and win projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-5 py-3 animate-in slide-in-from-left duration-500 flex-1">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground/80">
                <span className="text-primary">Monthly Reward:</span> You receive <span className="text-primary">10 free SkillTokens</span> every month to keep your bidding active! 🚀
              </p>
            </div>
            
            <Button 
              onClick={() => setIsBuyModalOpen(true)}
              className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2 shrink-0"
            >
              <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Buy Tokens
            </Button>
          </div>
        </div>

        {/* Balance + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main balance card */}
          <Card className="md:col-span-1 bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-2xl shadow-amber-500/30 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <CardContent className="p-8 relative z-10">
              <p className="text-amber-100 text-sm font-semibold uppercase tracking-widest mb-2">
                Current Balance
              </p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-6xl font-black leading-none">{loading ? "—" : balance}</span>
                <span className="text-xl font-bold text-amber-100 mb-1">tokens</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-bold">SkillTokens</span>
              </div>
            </CardContent>
          </Card>

          {/* Earned */}
          <Card className="bg-card/50 border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Earned</p>
                <p className="text-3xl font-black text-emerald-500">+{totalEarned}</p>
                <p className="text-xs text-muted-foreground mt-0.5">All credits</p>
              </div>
            </CardContent>
          </Card>

          {/* Spent */}
          <Card className="bg-card/50 border-border hover:border-destructive/30 transition-colors">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
                <p className="text-3xl font-black text-red-500">-{totalSpent}</p>
                <p className="text-xs text-muted-foreground mt-0.5">On proposals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How Token Cost Works */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Info className="w-5 h-5" />
              How Token Cost Is Calculated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 p-4 bg-background/60 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Briefcase className="w-4 h-4" />
                  Fixed Budget
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Under $50</span><Badge variant="outline" className="text-[10px] h-4">2 tokens</Badge></div>
                  <div className="flex justify-between"><span>$50 – $99</span><Badge variant="outline" className="text-[10px] h-4">4 tokens</Badge></div>
                  <div className="flex justify-between"><span>$100 – $199</span><Badge variant="outline" className="text-[10px] h-4">6 tokens</Badge></div>
                  <div className="flex justify-between"><span>$200 – $499</span><Badge variant="outline" className="text-[10px] h-4">8 tokens</Badge></div>
                  <div className="flex justify-between"><span>$500 – $999</span><Badge variant="outline" className="text-[10px] h-4">12 tokens</Badge></div>
                  <div className="flex justify-between"><span>$1000+</span><Badge variant="outline" className="text-[10px] h-4">16 tokens</Badge></div>
                </div>
              </div>
              <div className="space-y-2 p-4 bg-background/60 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Zap className="w-4 h-4" />
                  Hourly Rate
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Under $5/hr</span><Badge variant="outline" className="text-[10px] h-4">1 token</Badge></div>
                  <div className="flex justify-between"><span>$5 – $9/hr</span><Badge variant="outline" className="text-[10px] h-4">2 tokens</Badge></div>
                  <div className="flex justify-between"><span>$10 – $19/hr</span><Badge variant="outline" className="text-[10px] h-4">3 tokens</Badge></div>
                  <div className="flex justify-between"><span>$20 – $39/hr</span><Badge variant="outline" className="text-[10px] h-4">5 tokens</Badge></div>
                  <div className="flex justify-between"><span>$40 – $79/hr</span><Badge variant="outline" className="text-[10px] h-4">7 tokens</Badge></div>
                  <div className="flex justify-between"><span>$80+/hr</span><Badge variant="outline" className="text-[10px] h-4">10 tokens</Badge></div>
                </div>
              </div>
              <div className="space-y-2 p-4 bg-background/60 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Star className="w-4 h-4" />
                  Experience Multiplier
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Entry Level</span><Badge variant="outline" className="text-[10px] h-4">×1.0</Badge></div>
                  <div className="flex justify-between"><span>Intermediate</span><Badge variant="outline" className="text-[10px] h-4">×1.25</Badge></div>
                  <div className="flex justify-between"><span>Senior / Expert</span><Badge variant="outline" className="text-[10px] h-4">×1.5</Badge></div>
                </div>
              </div>
              <div className="space-y-2 p-4 bg-background/60 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Users className="w-4 h-4" />
                  Extra Adjustments
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Featured project</span><Badge variant="outline" className="text-[10px] h-4">+2</Badge></div>
                  <div className="flex justify-between"><span>High competition (20+ bids)</span><Badge variant="outline" className="text-[10px] h-4">+1</Badge></div>
                  <div className="flex justify-between"><span>Large project</span><Badge variant="outline" className="text-[10px] h-4">+1</Badge></div>
                  <div className="flex justify-between text-emerald-600 font-semibold mt-2"><span>Proposal withdrawn</span><Badge className="text-[10px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Refunded!</Badge></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-4 py-2">
              <span className="font-semibold text-foreground">💡 Tip:</span> Tokens are refunded if you withdraw a pending or shortlisted proposal. Apply strategically to maximize your chances.
            </p>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="p-5 rounded-full bg-muted/50">
                  <Coins className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <p className="font-semibold text-muted-foreground">No transactions yet</p>
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/freelancer/browse">Browse Projects <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          tx.type === "CREDIT"
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        )}
                      >
                        {tx.type === "CREDIT" ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {reasonLabels[tx.reason] || tx.reason}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {tx.description}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-lg font-black",
                          tx.type === "CREDIT" ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {tx.type === "CREDIT" ? "+" : "-"}{tx.amount}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Balance: {tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm font-medium text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TokenPurchaseModal
        open={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        moneyBalance={moneyBalance}
        currentTokenBalance={balance}
        onSuccess={() => fetchHistory(page)}
      />
    </DashboardLayout>
  );
}
