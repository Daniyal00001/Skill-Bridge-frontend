import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Pencil,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Award,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { clientService } from "@/lib/client.service";
import { ClientProfileModal } from "@/components/modals/ClientProfileModal";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ClientProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"about" | "project" | "verification">("about");

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await clientService.getMyProfile();
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch client profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const handleOpenModal = (section: string) => {
    setActiveSection(section as any);
    setIsModalOpen(true);
  };

  const client = {
    name: profile?.fullName || profile?.user?.name || user?.name || "Name not set",
    location: profile?.location || "Location not set",
    region: profile?.region || "",
    avatar: profile?.user?.profileImage || user?.profileImage || "",
    bio: profile?.bio || "No overview provided.",
    email: profile?.user?.email || user?.email,
    phoneNumber: profile?.user?.phoneNumber || "",
    verification: {
      email: profile?.user?.isEmailVerified ?? false,
      payment: profile?.user?.isPaymentVerified ?? false,
      phone: !!profile?.user?.phoneNumber,
      id: profile?.user?.isIdVerified ?? false,
    },
    projectPreferences: {
      budget: profile?.budgetRange || "Not set",
      paymentType: profile?.hiringPreference || "Not set",
      experienceNeeded: profile?.preferredExpLevel || "Not set",
      communication: profile?.commMethod || "Not set",
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b pb-10 border-border/50">
            <div className="relative group">
              <Avatar className="h-40 w-40 ring-4 ring-primary/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <AvatarImage src={client.avatar} />
                <AvatarFallback className="text-4xl font-black">
                  {client.name !== "Name not set" ? client.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2) : "CL"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-background rounded-xl flex items-center justify-center shadow-lg border border-border">
                {client.verification.id ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1 mt-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    {client.name}
                  </h1>
                  <Badge className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    Client Account
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {client.location}{client.region ? ` · ${client.region}` : ""}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {client.email} 
                    {client.verification.email && (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest gap-1 inline-flex items-center">
                        · Verified 
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                <Button
                  variant="outline"
                  className="rounded-xl h-11 px-6 font-bold hover:bg-accent active:scale-95 transition-all"
                  onClick={() => handleOpenModal("about")}
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            
            {/* 1. OVERVIEW (PROFILE) */}
            <div className="space-y-4 max-w-full overflow-hidden">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Profile Overview</h3>
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal("about")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium break-words whitespace-pre-wrap max-w-full">
                {client.bio}
              </p>
            </div>

            {/* 2. TRUST AND VERIFICATION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Trust & Verification</h3>
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal("verification")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Identity Verified", verified: client.verification.id },
                  { label: "Payment Verified", verified: client.verification.payment },
                  { label: "Phone Verified", verified: client.verification.phone },
                  { label: "Email Verified", verified: client.verification.email },
                ].map(({ label, verified }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-muted/20 border rounded-xl">
                    <span className={cn("text-sm font-semibold", verified ? "text-foreground" : "text-muted-foreground")}>
                      {label}
                    </span>
                    {verified ? (
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                       <span className="text-xs font-bold text-muted-foreground/50">Unverified</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PROJECT PREFERENCES */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Project Preferences</h3>
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal("project")} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: DollarSign, label: "Preferred Project Size", value: client.projectPreferences.budget },
                  { icon: Briefcase, label: "Payment Type", value: client.projectPreferences.paymentType },
                  { icon: Award, label: "Experience Needed", value: client.projectPreferences.experienceNeeded },
                  { icon: MessageSquare, label: "Communication", value: client.projectPreferences.communication },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4 items-start p-4 bg-muted/10 border rounded-xl shadow-sm">
                    <div className="mt-1 p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">{label}</p>
                      <p className="text-base font-semibold mt-1">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </motion.div>
      </div>

      <ClientProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProfile}
        initialData={profile}
        defaultSection={activeSection}
      />
    </DashboardLayout>
  );
}
