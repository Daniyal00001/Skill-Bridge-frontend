import { useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";




const ClientSettingsPage = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = useMemo(
    () => [
      { label: "At least 8 characters", met: passwords.newPassword.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(passwords.newPassword) },
      { label: "Lowercase letter", met: /[a-z]/.test(passwords.newPassword) },
      { label: "One number", met: /[0-9]/.test(passwords.newPassword) },
      { label: "Special character (@$!%*?&)", met: /[@$!%*?&]/.test(passwords.newPassword) },
    ],
    [passwords.newPassword]
  );
  
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

  // ClientProfile returns { success, profile: { ...clientProfile, user: {...} } }
  const user = profileResponse?.profile?.user || {};
  const profile = profileResponse?.profile || {};

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account settings updated");
    }, 1000);
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwords) => {
      const res = await api.put("/auth/change-password", data);
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "" });
      queryClient.invalidateQueries({ queryKey: ["clientProfileSettings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update password");
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put("/auth/notification-settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Notification settings updated");
      queryClient.invalidateQueries({ queryKey: ["clientProfileSettings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update notifications");
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const isFirstTimePassword = user.googleId && !user.hasPassword;
    
    if (isFirstTimePassword) {
      if (!passwords.newPassword) {
        return toast.error("Please enter a new password");
      }
    } else {
      if (!passwords.currentPassword || !passwords.newPassword) {
        return toast.error("Please fill in all password fields");
      }
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (passwords.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (!passwordRegex.test(passwords.newPassword)) {
      return toast.error("Password must include uppercase, lowercase, number and special character (@$!%*?&)");
    }
    changePasswordMutation.mutate(passwords);
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
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border",
            user.idVerificationStatus === "APPROVED"
              ? "bg-green-500/10 border-green-200 text-green-600"
              : user.idVerificationStatus === "PENDING"
              ? "bg-blue-500/10 border-blue-200 text-blue-600"
              : user.idVerificationStatus === "REJECTED"
              ? "bg-red-500/10 border-red-200 text-red-600"
              : "bg-amber-500/10 border-amber-200 text-amber-600"
          )}>
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold">
              ID: {user.idVerificationStatus === "APPROVED" ? "Verified"
                : user.idVerificationStatus === "PENDING" ? "Under Review"
                : user.idVerificationStatus === "REJECTED" ? "Rejected"
                : "Not Submitted"}
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
                      Account Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Email Address</span>
                      </div>
                      <Badge className={cn(
                        "border-none",
                        user.isEmailVerified ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      )}>
                        {user.isEmailVerified ? "Verified" : "Unverified"}
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

                    {user.idVerificationStatus === "PENDING" && (
                      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-center space-y-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-blue-900 text-sm">Verification in Progress</p>
                          <p className="text-xs text-blue-700/70">Your documents are being reviewed by our team. This usually takes 24-48 hours.</p>
                        </div>
                      </div>
                    )}

                    {user.idVerificationStatus === "APPROVED" && (
                      <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-900 text-sm">Identity Verified</p>
                          <p className="text-xs text-emerald-700/70">Your identity has been fully verified. You can now access all platform features.</p>
                        </div>
                      </div>
                    )}

                    {(!user.idVerificationStatus || user.idVerificationStatus === "UNSUBMITTED" || user.idVerificationStatus === "REJECTED") && (
                      <div className="space-y-3 pt-2">
                        <div className="border-2 border-dashed border-border/50 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 relative">
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp,image/jpg"
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
                              <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, or WEBP max 5MB</p>
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
                {user.googleId && (
                  <div className="p-3 bg-blue-500/5 border border-blue-200/50 rounded-lg flex items-center gap-3 mb-4">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <p className="text-[11px] text-blue-700 font-medium">
                      Linked with Google. {user.hasPassword ? "You can login with either Google or your password." : "Set a password to enable email/password login alongside Google."}
                    </p>
                  </div>
                )}

                {(!user.googleId || user.hasPassword) && (
                  <div className="space-y-2 text-left">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      placeholder="Enter current password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                )}

                  <div className="space-y-2 text-left">
                    <Label htmlFor="new-password">
                      {user.googleId && !user.hasPassword ? "Set Password" : "New Password"}
                    </Label>
                    <div className="relative group">
                      <Input 
                        id="new-password" 
                        type={showPassword ? "text" : "password"}
                        placeholder={user.googleId && !user.hasPassword ? "Create a new password" : "Enter new password"}
                        className="pr-10"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Requirements Checklist */}
                    {passwords.newPassword.length > 0 && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          Security Requirements
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {passwordRequirements.map((req, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300",
                                  req.met
                                    ? "bg-primary text-white scale-110"
                                    : "bg-muted-foreground/20",
                                )}
                              >
                                {req.met && <CheckCircle2 className="w-2.5 h-2.5" />}
                              </div>
                              <span
                                className={cn(
                                  "text-[10px] transition-colors duration-300",
                                  req.met
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground",
                                )}
                              >
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {user.googleId && !user.hasPassword ? "Set Password" : "Update Security"}
                  </Button>
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
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Project Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when someone bids on your project.
                    </p>
                  </div>
                  <Switch 
                    checked={user.projectNotifications ?? true}
                    onCheckedChange={(checked) => updateNotificationsMutation.mutate({ projectNotifications: checked })}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Messages</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you receive a message.
                    </p>
                  </div>
                  <Switch 
                    checked={user.messageNotifications ?? true}
                    onCheckedChange={(checked) => updateNotificationsMutation.mutate({ messageNotifications: checked })}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40">
                  <div>
                    <p className="font-bold">Account Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Security and billing notifications.
                    </p>
                  </div>
                  <Switch 
                    checked={user.accountNotifications ?? true}
                    onCheckedChange={(checked) => updateNotificationsMutation.mutate({ accountNotifications: checked })}
                    disabled={updateNotificationsMutation.isPending}
                  />
                </div>
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
