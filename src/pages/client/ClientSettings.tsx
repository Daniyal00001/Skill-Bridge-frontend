import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  User,
  Lock,
  Building,
  Mail,
  Camera,
  Loader2,
  Briefcase,
  Globe,
  Info,
  CreditCard,
  CheckCircle2,
  MapPin,
  Clock,
  Calendar,
  Award,
  ShieldCheck,
  Activity,
  Trophy,
  Star,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Mock User Data
const MOCK_USER = {
  name: "John Client",
  email: "john@techcorp.com",
  company: "TechCorp Inc.",
  avatar: "https://github.com/shadcn.png",
  bio: "Visionary entrepreneur focused on scaling AI-driven SaaS platforms. Looking for top-tier developers who value code quality and long-term collaboration.",
  companyType: "Startup",
  industry: "e-commerce",
  hiringPreference: "Hourly",
  budgetRange: "Medium",
  experienceLevel: "Expert",
  commMethod: "Slack/Messages",
  timezone: "UTC+5",
  availability: "Part-time (20hrs/week)",
  totalProjects: 14,
  completedProjects: 12,
  avgRating: 4.8,
  memberSince: "Jan 2024",
  emailVerified: true,
  paymentVerified: true,
  profileCompletion: 85,
};

const ClientSettingsPage = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["clientProfileSettings"],
    queryFn: async () => {
      const res = await api.get("/client/profile");
      return res.data;
    },
  });

  const [idFile, setIdFile] = useState<File | null>(null);

  const uploadIdMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("idDocument", file);
      const res = await api.post("/client/profile/upload-id", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("ID Document uploaded successfully!");
      setIdFile(null);
      queryClient.invalidateQueries({ queryKey: ["clientProfileSettings"] });
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
              Manage your account security and preferences.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">
              Account Status: Verified
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
            <TabsTrigger value="notifications" className="gap-2">
              <Activity className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" /> Billing
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
                      Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Email
                      </span>
                      <Badge className="bg-green-500/10 text-green-500 border-none">
                        Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Identity Verification Section */}
                <Card className="border-border/40 bg-card/80 shadow-md flex-1">
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
                        <Badge className="bg-green-500/10 text-green-500 border-none"><CheckCircle2 className="h-3 w-3 mr-1"/> Approved</Badge>
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
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Protect your account with a strong password.
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
                <Button onClick={handleChangePassword}>Update Security</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                {[
                  {
                    title: "Project Updates",
                    desc: "Get notified when someone bids on your project.",
                  },
                  {
                    title: "Messages",
                    desc: "Get notified when you receive a message.",
                  },
                  {
                    title: "Account Alerts",
                    desc: "Security and billing notifications.",
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

          {/* Billing Tab */}
          <TabsContent
            value="billing"
            className="animate-in fade-in-50 duration-500"
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
              <CardHeader>
                <CardTitle>Billing & Payments</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
                  <CreditCard className="h-8 w-8" />
                  <p className="font-bold">Add Payment Method</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientSettingsPage;
