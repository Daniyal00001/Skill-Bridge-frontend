import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientService } from "@/lib/client.service";
import { toast } from "sonner";
import { Loader2, ShieldCheck, MapPin, Globe, Phone } from "lucide-react";
import { useMetadata } from "@/hooks/useMetadata";
import { parsePhoneNumberFromString } from "libphonenumber-js";

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: any;
  defaultSection?: "about" | "project" | "verification";
}

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
  const { locations } = useMetadata();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultSection);
      setFormData({
        fullName: initialData?.fullName || "",
        bio: initialData?.bio || "",
        location: initialData?.location || "",
        region: initialData?.region || "",
        phoneNumber: initialData?.user?.phoneNumber || "",
        hiringPreference: initialData?.hiringPreference || "",
        budgetRange: initialData?.budgetRange || "",
        preferredExpLevel: initialData?.preferredExpLevel || "",
        commMethod: initialData?.commMethod || "",
        language: initialData?.language || "",
        locationPref: initialData?.locationPref || "",
        hiringMethod: initialData?.hiringMethod || "",
      });
    }
  }, [isOpen, initialData, defaultSection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev: any) => ({ ...prev, phoneNumber: phone }));

    // Auto-detect country and region from phone number
    if (phone.startsWith("+")) {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (phoneNumber && phoneNumber.isValid()) {
        const countryCode = phoneNumber.countryCallingCode;
        const matchedLocation = locations.find(
          (loc) => loc.phoneCode === countryCode,
        );
        if (matchedLocation) {
          setFormData((prev: any) => ({
            ...prev,
            location: matchedLocation.name,
            region: matchedLocation.region || "",
          }));
          toast.success(`Location detected as ${matchedLocation.name}`);
        }
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

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

  const titles = {
    about: "Edit Profile Overview",
    project: "Edit Project Preferences",
    verification: "Verify Your Identity",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border/40">
          <DialogTitle className="text-2xl font-black text-foreground">{titles[activeTab as keyof typeof titles]}</DialogTitle>
          <DialogDescription className="text-xs font-medium">Update the specific details for this section.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "about" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</label>
                    <Select
                      value={formData.location}
                      onValueChange={(val) => handleSelectChange("location", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.name}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Region / State</label>
                    <Input
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="e.g. California"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview / Bio</label>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell freelancers about yourself and the projects you typically hire for..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeTab === "project" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Project Size</label>
                    <Select
                      value={formData.budgetRange}
                      onValueChange={(val) => handleSelectChange("budgetRange", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small (Quick task)">Small (Quick task)</SelectItem>
                        <SelectItem value="Medium (Few months)">Medium (Few months)</SelectItem>
                        <SelectItem value="Large (Long term)">Large (Long term)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Payment Type</label>
                    <Select
                      value={formData.hiringPreference}
                      onValueChange={(val) => handleSelectChange("hiringPreference", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fixed">Fixed Price</SelectItem>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Needed</label>
                    <Select
                      value={formData.preferredExpLevel}
                      onValueChange={(val) => handleSelectChange("preferredExpLevel", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRY">Beginner</SelectItem>
                        <SelectItem value="MID">Intermediate</SelectItem>
                        <SelectItem value="SENIOR">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Communication</label>
                    <Select
                      value={formData.commMethod}
                      onValueChange={(val) => handleSelectChange("commMethod", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Platform Chat">Platform Chat</SelectItem>
                        <SelectItem value="Slack/Teams">Slack / Teams</SelectItem>
                        <SelectItem value="Email/Zoom">Email / Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Language</label>
                    <Select
                      value={formData.language}
                      onValueChange={(val) => handleSelectChange("language", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Urdu">Urdu</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hiring Method</label>
                    <Select
                      value={formData.hiringMethod}
                      onValueChange={(val) => handleSelectChange("hiringMethod", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bidding">Bidding</SelectItem>
                        <SelectItem value="Direct Hire">Direct Hire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location Preference</label>
                  <Select
                    value={formData.locationPref}
                    onValueChange={(val) => handleSelectChange("locationPref", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location preference..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any location">Any location</SelectItem>
                      <SelectItem value="Same Region">Same Region</SelectItem>
                      <SelectItem value="Same Country">Same Country</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These preferences help us recommend the right freelancers for your projects.
                </p>
              </div>
            )}

            {activeTab === "verification" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-6">
                <ShieldCheck className="w-16 h-16 text-primary mx-auto opacity-50 mb-4" />
                <h3 className="text-lg font-bold">Verification Settings</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Identity, phone, and payment verifications are managed automatically through secure providers (e.g. Stripe, SMS OTP). 
                  Please go to the Security Settings page to initiate formal verifications.
                </p>
                <Button type="button" variant="outline" className="mt-4" onClick={onClose}>
                  Got it
                </Button>
              </div>
            )}

            {activeTab !== "verification" && (
              <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
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
