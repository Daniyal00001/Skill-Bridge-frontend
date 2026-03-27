import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientService } from "@/lib/client.service";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  X,
} from "lucide-react";
import { useMetadata } from "@/hooks/useMetadata";
import { Badge } from "@/components/ui/badge";

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: any;
  defaultSection?: "about" | "project" | "verification";
}

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level (Beginner)" },
  { value: "MID", label: "Mid Level (Intermediate)" },
  { value: "SENIOR", label: "Senior Level (Expert)" },
  { value: "EXPERT", label: "Expert / Top Tier" },
];

export function ClientProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  defaultSection = "about",
}: ClientProfileModalProps) {
  const [activeTab, setActiveTab] = useState(defaultSection);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { locations, languages } = useMetadata();

  // Verification sub-states for email
  const [emailStep, setEmailStep] = useState<"idle" | "otp">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Verification sub-states for phone
  const [phoneStep, setPhoneStep] = useState<"idle" | "otp">("idle");
  const [newPhone, setNewPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Derived: unique regions from DB
  const uniqueRegions = Array.from(
    new Set(locations.map((l) => l.region).filter(Boolean))
  ).sort() as string[];

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultSection);
      setEmailStep("idle");
      setPhoneStep("idle");
      setNewEmail("");
      setEmailOtp("");
      setNewPhone(initialData?.user?.phoneNumber || "");
      setPhoneOtp("");
      setFormData({
        fullName: initialData?.fullName || "",
        bio: initialData?.bio || "",
        location: initialData?.location || "",
        region: initialData?.region || "",
        hiringPreference: initialData?.hiringPreference || "",
        preferredExpLevel: initialData?.preferredExpLevel || "",
        language: initialData?.language || "",
        locationPref: initialData?.locationPref || "",
        hiringMethod: initialData?.hiringMethod || "",
        preferredRegion: initialData?.preferredRegion || "",
        spokenLanguages: initialData?.spokenLanguages || [],
        hourlyBudgetMin: initialData?.hourlyBudgetMin ?? "",
        hourlyBudgetMax: initialData?.hourlyBudgetMax ?? "",
      });
    }
  }, [isOpen, initialData, defaultSection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    // Auto-fill region when country is selected
    if (name === "location") {
      const loc = locations.find((l) => l.name === value);
      if (loc?.region) {
        setFormData((prev: any) => ({ ...prev, location: value, region: loc.region }));
      }
    }
  };

  // Multi-language toggle (max 3)
  const toggleLanguage = (lang: string) => {
    setFormData((prev: any) => {
      const current: string[] = prev.spokenLanguages || [];
      if (current.includes(lang)) {
        return { ...prev, spokenLanguages: current.filter((l) => l !== lang) };
      }
      if (current.length >= 3) {
        toast.warning("You can select up to 3 languages");
        return prev;
      }
      return { ...prev, spokenLanguages: [...current, lang] };
    });
  };

  // ── Submit profile update ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await clientService.updateProfile(formData);
      toast.success("Profile updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email OTP flow ────────────────────────────────────────────
  const handleRequestEmail = async () => {
    if (!newEmail) return toast.error("Please enter a new email");
    setEmailLoading(true);
    try {
      await clientService.requestEmailChange(newEmail);
      toast.success(`OTP sent to ${newEmail}`);
      setEmailStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp) return toast.error("Please enter the OTP");
    setEmailLoading(true);
    try {
      await clientService.verifyEmailChange(emailOtp);
      toast.success("Email updated and verified!");
      setEmailStep("idle");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Phone OTP flow ────────────────────────────────────────────
  const handleRequestPhone = async () => {
    if (!newPhone) return toast.error("Please enter a phone number");
    setPhoneLoading(true);
    try {
      await clientService.requestPhoneOtp(newPhone);
      toast.success("OTP sent to WhatsApp");
      setPhoneStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOtp) return toast.error("Please enter the OTP");
    setPhoneLoading(true);
    try {
      await clientService.verifyPhoneOtp(phoneOtp);
      toast.success("Phone number verified!");
      setPhoneStep("idle");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const titles = {
    about: "Edit Profile Overview",
    project: "Preferred Freelancer",
    verification: "Trust & Verification",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border/40">
          <DialogTitle className="text-2xl font-black text-foreground">
            {titles[activeTab as keyof typeof titles]}
          </DialogTitle>
          <DialogDescription className="text-xs font-medium">
            Update the specific details for this section.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── ABOUT TAB ───────────────────────────────────── */}
            {activeTab === "about" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</label>
                    <Select value={formData.location} onValueChange={(val) => handleSelectChange("location", val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Region / State (auto)</label>
                    <Input
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="Auto-detected from country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview / Bio</label>
                  <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell freelancers about yourself..." rows={4} />
                </div>
              </div>
            )}

            {/* ── PROJECT / PREFERRED FREELANCER TAB ──────────── */}
            {activeTab === "project" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Hourly Rate Range */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hourly Rate Range ($/hr)</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      name="hourlyBudgetMin"
                      value={formData.hourlyBudgetMin}
                      onChange={handleChange}
                      placeholder="Min (e.g. 5)"
                      min={1}
                    />
                    <span className="text-muted-foreground font-bold">–</span>
                    <Input
                      type="number"
                      name="hourlyBudgetMax"
                      value={formData.hourlyBudgetMax}
                      onChange={handleChange}
                      placeholder="Max (e.g. 50)"
                      min={1}
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Level Needed</label>
                  <Select value={formData.preferredExpLevel} onValueChange={(val) => handleSelectChange("preferredExpLevel", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Freelancer Language */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Freelancer Language</label>
                  <Select value={formData.language} onValueChange={(val) => handleSelectChange("language", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client's Spoken Languages (multi-select, max 3) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your Spoken Languages <span className="text-muted-foreground/50 normal-case">(max 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-muted/10 min-h-[48px]">
                    {(formData.spokenLanguages || []).map((lang: string) => (
                      <Badge key={lang} className="gap-1.5 pl-3 pr-1.5 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
                        {lang}
                        <button type="button" onClick={() => toggleLanguage(lang)} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {languages.slice(0, 12).map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleLanguage(l.name)}
                        className={`text-xs py-1.5 px-2 rounded-lg border transition-all font-medium ${
                          (formData.spokenLanguages || []).includes(l.name)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Preference (regions from DB) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location Preference</label>
                  <Select value={formData.preferredRegion} onValueChange={(val) => handleSelectChange("preferredRegion", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any region..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any location</SelectItem>
                      {uniqueRegions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            )}

            {/* ── VERIFICATION TAB ─────────────────────────────── */}
            {activeTab === "verification" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Phone Section */}
                <div className="p-5 border rounded-2xl space-y-4 bg-muted/10">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black uppercase tracking-wider">Verify Phone via WhatsApp</span>
                  </div>

                  {phoneStep === "idle" ? (
                    <div className="flex gap-2">
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                      />
                      <Button type="button" onClick={handleRequestPhone} disabled={phoneLoading} className="shrink-0">
                        {phoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">OTP sent to WhatsApp: <strong>{newPhone}</strong></p>
                      <div className="flex gap-2">
                        <Input
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                        <Button type="button" onClick={handleVerifyPhone} disabled={phoneLoading} className="shrink-0">
                          {phoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setPhoneStep("idle")} className="shrink-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">⚠️ WhatsApp OTP is logged to the backend console for testing. A real provider (Twilio/Meta) can be plugged in later.</p>
                </div>
              </div>
            )}

            {/* ── FOOTER BUTTONS ───────────────────────────────── */}
            {activeTab !== "verification" && (
              <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
