import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Settings,
  Loader2,
  Pencil,
  Plus,
  DollarSign,
  Percent,
  Coins,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

const PREDEFINED_SETTINGS = [
  {
    key: "platform_fee_percentage",
    label: "Platform Fee (%)",
    description: "Percentage taken from each released payment",
    icon: Percent,
    category: "Finance",
    type: "number",
    placeholder: "10",
  },
  {
    key: "registration_bonus_tokens",
    label: "Registration Bonus Tokens",
    description: "Tokens credited when a new freelancer registers",
    icon: Coins,
    category: "Tokens",
    type: "number",
    placeholder: "20",
  },
  {
    key: "proposal_token_cost",
    label: "Proposal Token Cost",
    description: "Tokens deducted per proposal submission",
    icon: Coins,
    category: "Tokens",
    type: "number",
    placeholder: "2",
  },
  {
    key: "min_withdrawal_amount",
    label: "Minimum Withdrawal ($)",
    description: "Minimum amount a freelancer can withdraw",
    icon: DollarSign,
    category: "Finance",
    type: "number",
    placeholder: "10",
  },
  {
    key: "max_withdrawal_amount",
    label: "Maximum Withdrawal ($)",
    description: "Maximum amount per single withdrawal",
    icon: DollarSign,
    category: "Finance",
    type: "number",
    placeholder: "5000",
  },
  {
    key: "project_proposal_limit",
    label: "Max Proposals Per Project",
    description: "Maximum number of proposals a project can receive",
    icon: Info,
    category: "Projects",
    type: "number",
    placeholder: "50",
  },
];

const fetchSettings = async (): Promise<PlatformSetting[]> => {
  const res = await api.get("/admin/settings");
  return res.data.settings;
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<{
    open: boolean;
    key?: string;
    value?: string;
    label?: string;
  }>({ open: false });
  const [editValue, setEditValue] = useState("");
  const [customKey, setCustomKey] = useState("");

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: fetchSettings,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: { key: string; value: string }) =>
      api.put("/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      toast.success("Setting updated successfully");
      setDialog({ open: false });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const getSettingValue = (key: string) =>
    settings.find((s) => s.key === key)?.value;

  const openEdit = (key: string, label: string) => {
    const current = getSettingValue(key) || "";
    setEditValue(current);
    setDialog({ open: true, key, value: current, label });
  };

  const openCustom = () => {
    setCustomKey("");
    setEditValue("");
    setDialog({ open: true, key: undefined, label: "Custom Setting" });
  };

  const handleSubmit = () => {
    const key = dialog.key || customKey;
    if (!key || editValue === undefined) return;
    upsertMutation.mutate({ key, value: editValue });
  };

  const CATEGORIES = [...new Set(PREDEFINED_SETTINGS.map((s) => s.category))];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Configuration
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage global platform configurations that affect all users.
            </p>
          </div>
          <Button variant="outline" onClick={openCustom} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Custom Setting
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {cat}
                </h2>
                <div className="grid gap-3">
                  {PREDEFINED_SETTINGS.filter((s) => s.category === cat).map((setting) => {
                    const Icon = setting.icon;
                    const currentValue = getSettingValue(setting.key);
                    return (
                      <Card key={setting.key} className="border border-border/50 rounded-xl">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-primary/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{setting.label}</p>
                              <p className="text-[11px] text-muted-foreground">{setting.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              {currentValue !== undefined ? (
                                <p className="text-lg font-bold text-foreground">{currentValue}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">Not set</p>
                              )}
                              {currentValue !== undefined && (
                                <p className="text-[10px] text-muted-foreground">
                                  Default: {setting.placeholder}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => openEdit(setting.key, setting.label)}
                            >
                              <Pencil className="h-3 w-3" />
                              {currentValue !== undefined ? "Edit" : "Set"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom/Other settings not in predefined list */}
            {settings.filter((s) => !PREDEFINED_SETTINGS.find((p) => p.key === s.key)).length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Custom Settings
                </h2>
                <div className="grid gap-3">
                  {settings
                    .filter((s) => !PREDEFINED_SETTINGS.find((p) => p.key === s.key))
                    .map((setting) => (
                      <Card key={setting.id} className="border border-border/50 rounded-xl">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              <Settings className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground font-mono">{setting.key}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Last updated: {new Date(setting.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="text-lg font-bold text-foreground">{setting.value}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => openEdit(setting.key, setting.key)}
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog.key ? `Edit: ${dialog.label}` : "Add Custom Setting"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!dialog.key && (
              <div className="space-y-1.5">
                <Label>Setting Key *</Label>
                <Input
                  placeholder="e.g. feature_flag_x"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="font-mono"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Value *</Label>
              <Input
                placeholder="Enter value..."
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!editValue || (!dialog.key && !customKey) || upsertMutation.isPending}
            >
              {upsertMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
