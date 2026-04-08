import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  User,
  Lock,
  Mail,
  Loader2,
  Activity,
  CreditCard,
  ShieldCheck,
  Wallet,
  Phone,
  UploadCloud,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Mock Freelancer Data
const MOCK_USER = {
  name: "Alex Chen",
  email: "alex.chen@work.com",
  phone: "+1 (555) 000-1111",
  accountType: "Freelancer",
  emailVerified: true,
  phoneVerified: true,
  balance: 1250.0,
};

const FreelancerSettings = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["freelancerProfile"],
    queryFn: async () => {
      const res = await api.get("/freelancers/me");
      return res.data;
    },
  });

  const [idFile, setIdFile] = useState<File | null>(null);

  const uploadIdMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("idDocument", file);
      const res = await api.post("/freelancers/onboarding/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("ID Document uploaded successfully!");
      setIdFile(null);
      queryClient.invalidateQueries({ queryKey: ["freelancerProfile"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to upload ID document.");
    },
  });

  const handleIdUpload = () => {
    if (!idFile) return;
    uploadIdMutation.mutate(idFile);
  };

  const user = profileResponse?.profile?.user || MOCK_USER;
  const profile = profileResponse?.profile || MOCK_USER;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account settings updated");
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated successfully");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage your freelancer account and payment preferences.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">
              Account Status: Top Rated
            </span>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" /> Account
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <Wallet className="h-4 w-4" /> Withdrawals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Activity className="h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent
            value="account"
            className="animate-in fade-in-50 duration-500"
          >
            <div className="max-w-xl mx-auto space-y-6">
                <Card className="border-border/40 bg-card/80 shadow-md">
                  <CardHeader className="pb-3 text-left">
                    <CardTitle className="text-lg font-bold">
                      Account Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-none">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-sm">Phone</span>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-none">
                        Pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Identity Verification Section */}
                <Card className="border-border/40 bg-card/80 shadow-md">
                  <CardHeader className="pb-3 text-left">
                    <CardTitle className="text-lg font-bold">Identity Verification</CardTitle>
                    <CardDescription>Upload your national ID or passport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> 
                        <span className="font-semibold text-sm">Status:</span>
                      </div>
                      {user.idVerificationStatus === "APPROVED" && (
                        <Badge className="bg-green-500/10 text-green-500 border-none"><CheckCircle className="h-3 w-3 mr-1"/> Approved</Badge>
                      )}
                      {user.idVerificationStatus === "PENDING" && (
                        <Badge className="bg-blue-500/10 text-blue-500 border-none"><Loader2 className="h-3 w-3 mr-1 animate-spin"/> Pending Review</Badge>
                      )}
                      {user.idVerificationStatus === "REJECTED" && (
                        <Badge variant="destructive" className="border-none"><XCircle className="h-3 w-3 mr-1"/> Rejected</Badge>
                      )}
                      {(!user.idVerificationStatus || user.idVerificationStatus === "UNSUBMITTED") && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-none">Unsubmitted</Badge>
                      )}
                    </div>

                    {user.idVerificationStatus === "REJECTED" && user.idRejectionReason && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs leading-relaxed border border-red-100">
                        <span className="font-bold block mb-1">Reason for Rejection:</span>
                        {user.idRejectionReason}
                      </div>
                    )}

                    {(!user.idVerificationStatus || user.idVerificationStatus === "UNSUBMITTED" || user.idVerificationStatus === "REJECTED") && (
                      <div className="space-y-3 pt-2">
                        <div className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 relative">
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setIdFile(e.target.files[0]);
                              }
                            }}
                          />
                          {!idFile ? (
                            <>
                              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground font-medium">Click or drag file to upload</p>
                              <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, or PDF max 5MB</p>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                               <ShieldCheck className="h-8 w-8 text-primary mb-1" />
                               <p className="text-xs font-semibold">{idFile.name}</p>
                               <p className="text-[10px] text-muted-foreground">Click to change file</p>
                            </div>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={!idFile || uploadIdMutation.isPending}
                          onClick={handleIdUpload}
                        >
                          {uploadIdMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Submit for Verification
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent
            value="security"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Update your credentials regularly to stay safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button onClick={handleChangePassword}>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent
            value="withdrawals"
            className="animate-in fade-in-50 duration-500"
          >
            <div className="grid md:grid-cols-[1fr_2fr] gap-6">
              <Card className="border-none bg-primary text-primary-foreground shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white/80 text-sm uppercase tracking-widest">
                    Available Balance
                  </CardTitle>
                  <p className="text-4xl font-black">
                    ${user.balance.toFixed(2)}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">
                    Withdraw Funds
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>Withdrawal Methods</CardTitle>
                  <CardDescription>
                    How you receive your earnings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-bold">Bank Account (...8829)</p>
                        <p className="text-xs text-muted-foreground">
                          Standard Withdrawal (2-3 days)
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Default</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-dashed group"
                  >
                    <CreditCard className="mr-2 h-4 w-4 group-hover:text-primary" />
                    Add Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Freelancer Notifications</CardTitle>
                <CardDescription>
                  Stay updated on new projects and invitations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                {[
                  {
                    title: "New Job Matches",
                    desc: "Get notified when a job matches your skills.",
                  },
                  {
                    title: "Proposal Status",
                    desc: "Get notified when your proposal is viewed or accepted.",
                  },
                  {
                    title: "Direct Invitations",
                    desc: "Get notified when a client invites you to a project.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/40"
                  >
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <div className="h-6 w-10 bg-primary/20 rounded-full flex items-center px-1 cursor-pointer">
                      <div className="h-4 w-4 bg-primary rounded-full transition-all translate-x-4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerSettings;
