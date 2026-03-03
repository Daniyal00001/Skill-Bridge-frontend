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
} from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(MOCK_USER);

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
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Primary account contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={user.name}
                        onChange={(e) =>
                          setUser({ ...user, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          defaultValue={user.phone}
                          onChange={(e) =>
                            setUser({ ...user, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2 text-left">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        defaultValue={user.email}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t p-6">
                  <Button onClick={handleSaveAccount}>Save Changes</Button>
                </CardFooter>
              </Card>

              <aside className="space-y-6">
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
                      <Badge className="bg-green-500/10 text-green-500 border-none">
                        Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </aside>
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
