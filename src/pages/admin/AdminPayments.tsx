import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Loader2,
  ArrowDownLeft,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PaymentStats {
  totalReleased: number;
  totalInEscrow: number;
  totalPending: number;
  totalRefunded: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt?: string;
  releasedAt?: string;
  createdAt: string;
  contract?: {
    project?: { id: string; title: string };
    freelancerProfile?: { user?: { name: string } };
  };
  milestone?: { title: string };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  stripeTransferId?: string;
  freelancerProfile?: {
    user?: { id: string; name: string; email: string; profileImage?: string };
  };
}

type ActiveTab = "payments" | "withdrawals";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  HELD_IN_ESCROW: "bg-blue-50 text-blue-700 border-blue-200",
  RELEASED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REFUNDED: "bg-violet-50 text-violet-700 border-violet-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};

const WITHDRAWAL_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};

const fetchPayments = async (status: string): Promise<{ payments: Payment[]; total: number; stats: PaymentStats }> => {
  const params = status !== "ALL" ? `?status=${status}` : "";
  const res = await api.get(`/admin/payments${params}`);
  return res.data;
};

const fetchWithdrawals = async (status: string): Promise<{ withdrawals: Withdrawal[]; total: number }> => {
  const params = status !== "ALL" ? `?status=${status}` : "";
  const res = await api.get(`/admin/withdrawals${params}`);
  return res.data;
};

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("payments");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("ALL");

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["adminPayments", paymentStatusFilter],
    queryFn: () => fetchPayments(paymentStatusFilter),
    enabled: activeTab === "payments",
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["adminWithdrawals", withdrawalStatusFilter],
    queryFn: () => fetchWithdrawals(withdrawalStatusFilter),
    enabled: activeTab === "withdrawals",
  });

  const stats = paymentsData?.stats;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Finance
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Payments &amp; Withdrawals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all platform transactions and freelancer payout requests.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Released", value: stats.totalReleased, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
              { label: "In Escrow", value: stats.totalInEscrow, color: "text-blue-600", bg: "bg-blue-50", icon: DollarSign },
              { label: "Platform Revenue (10%)", value: stats.totalReleased * 0.1, color: "text-violet-600", bg: "bg-violet-50", icon: CreditCard },
              { label: "Refunded", value: stats.totalRefunded, color: "text-red-600", bg: "bg-red-50", icon: ArrowDownLeft },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <Card key={label} className="border border-border/50 rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Payments
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <ArrowDownLeft className="h-3.5 w-3.5" /> Withdrawals
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "payments" && (
          <Card className="border border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="px-5 pt-4 pb-4 border-b border-border/30">
              <div className="flex flex-wrap gap-2">
                {["ALL", "PENDING", "HELD_IN_ESCROW", "RELEASED", "REFUNDED", "FAILED"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={paymentStatusFilter === s ? "default" : "outline"}
                    className="h-7 text-xs font-semibold"
                    onClick={() => setPaymentStatusFilter(s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Project</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Milestone</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Freelancer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(paymentsData?.payments || []).length > 0 ? (
                      (paymentsData?.payments || []).map((p) => (
                        <TableRow key={p.id} className="border-border/30 hover:bg-muted/20">
                          <TableCell className="pl-6">
                            <p className="text-sm font-medium truncate max-w-[180px]">
                              {p.contract?.project?.title || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.milestone?.title || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.contract?.freelancerProfile?.user?.name || "N/A"}
                          </TableCell>
                          <TableCell className="font-bold text-sm">
                            ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border",
                              PAYMENT_STATUS_COLORS[p.status] || ""
                            )}>
                              {p.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(p.releasedAt || p.paidAt || p.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                          No payments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "withdrawals" && (
          <Card className="border border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="px-5 pt-4 pb-4 border-b border-border/30">
              <div className="flex flex-wrap gap-2">
                {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={withdrawalStatusFilter === s ? "default" : "outline"}
                    className="h-7 text-xs font-semibold"
                    onClick={() => setWithdrawalStatusFilter(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Freelancer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Stripe Transfer</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Requested</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(withdrawalsData?.withdrawals || []).length > 0 ? (
                      (withdrawalsData?.withdrawals || []).map((w) => (
                        <TableRow key={w.id} className="border-border/30 hover:bg-muted/20">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={w.freelancerProfile?.user?.profileImage} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {w.freelancerProfile?.user?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{w.freelancerProfile?.user?.name || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground">{w.freelancerProfile?.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-sm">
                            ${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border",
                              WITHDRAWAL_STATUS_COLORS[w.status] || ""
                            )}>
                              {w.status}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {w.stripeTransferId ? (
                              <span className="truncate max-w-[120px] block">{w.stripeTransferId}</span>
                            ) : w.failureReason ? (
                              <span className="text-red-500 text-[11px]">{w.failureReason}</span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(w.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {w.processedAt ? new Date(w.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                          No withdrawals found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
