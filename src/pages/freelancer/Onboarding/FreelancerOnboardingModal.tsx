import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { freelancerService } from "@/lib/freelancer.service";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  X,
  Upload,
  CheckCircle2,
  Briefcase,
  Sparkles,
  User,
  Globe,
  Pencil,
} from "lucide-react";
import { useMetadata } from "@/hooks/useMetadata";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SkillAutocomplete } from "@/components/common/SkillAutocomplete";

// ---------------------------------------------------------------------------
// Per-field completion weights (must sum to 100)
// ---------------------------------------------------------------------------
const WEIGHTS = {
  nameTagline: 10,   // Full name + tagline
  phone: 5,          // Phone number
  location: 5,       // Country
  hourlyRate: 10,    // Hourly rate
  bio: 10,           // Bio (≥100 chars)
  experienceLevel: 5,// Experience level
  skills: 15,        // Skills (≥1)
  languages: 5,      // Languages (≥1)
  education: 5,      // Education (≥1 entry)
  profileImage: 10,  // Profile image (Reduced from 15)
  budget: 5,         // Preferred Budget Range (NEW)
  portfolio: 10,     // Cert / gig / portfolio
  links: 5,          // Any social link
} as const;

function computeLocalCompletion(
  formData: any,
  files: { profileImage: File | null },
  existingProfileImage: string | null | undefined,
  certifications: any[],
  gigs: any[],
): number {
  let score = 0;
  if (
    formData.fullName?.trim().length >= 3 &&
    formData.tagline?.trim().length >= 10
  ) score += WEIGHTS.nameTagline;
  if (formData.phoneNumber?.trim()) score += WEIGHTS.phone;
  if (formData.location?.trim()) score += WEIGHTS.location;
  if (Number(formData.hourlyRate) >= 5) score += WEIGHTS.hourlyRate;
  if (formData.bio?.trim().length >= 100) score += WEIGHTS.bio;
  if (formData.experienceLevel) score += WEIGHTS.experienceLevel;
  if (formData.skills.length > 0) score += WEIGHTS.skills;
  if (formData.languages.length > 0) score += WEIGHTS.languages;
  if (formData.educations.some((e: any) => e.school?.trim() && e.degree?.trim()))
    score += WEIGHTS.education;
  if (files.profileImage || existingProfileImage) score += WEIGHTS.profileImage;
  if (
    certifications.length > 0 ||
    gigs.length > 0 ||
    formData.portfolio?.trim()
  ) score += WEIGHTS.portfolio;
  if (
    formData.github?.trim() ||
    formData.linkedin?.trim() ||
    formData.portfolio?.trim() ||
    formData.website?.trim()
  ) score += WEIGHTS.links;
  return Math.min(score, 100);
}

// Small helper pill shown next to section headers
function WeightBadge({ pct, isComplete }: { pct: number; isComplete?: boolean }) {
  if (isComplete) {
    return (
      <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> {pct}%
      </span>
    );
  }
  return (
    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
      +{pct}%
    </span>
  );
}

export function FreelancerOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  profile: any;
}) {
  // Determine the starting step based on what's missing
  let initialStep = 1;
  if (
    profile?.fullName ||
    (profile?.user?.name && profile?.location && profile?.tagline)
  )
    initialStep = 2;
  if (initialStep === 2 && profile?.hourlyRate && profile?.bio) initialStep = 3;
  if (initialStep === 3 && profile?.skills?.length > 0) initialStep = 4;
  if (
    initialStep === 4 &&
    profile?.user?.profileImage &&
    (profile?.certificates?.length > 0 || profile?.gigs?.length > 0)
  )
    initialStep = 5;

  const [step, setStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const { locations, languages: metadataLanguages } = useMetadata();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories || []));
  }, []);

  // State
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || profile?.user?.name || "",
    phoneNumber: profile?.user?.phoneNumber || "",
    location: profile?.location || "",
    region: profile?.region || "",
    tagline: profile?.tagline || "",
    hourlyRate: profile?.hourlyRate?.toString() || "",
    bio: profile?.bio || "",
    availability: profile?.availability || "AVAILABLE",
    experienceLevel: profile?.experienceLevel || "ENTRY",
    skills:
      profile?.skills?.map((s: any) => ({
        name: s.skill?.name || s.name,
        level: s.proficiencyLevel || 3,
      })) || [],
    educations: profile?.educations || [
      { school: "", degree: "", year: "", level: "University" },
    ],
    languages:
      profile?.languages?.map((l: any) =>
        typeof l === "string" ? { name: l } : l,
      ) || [],
    github: profile?.github || "",
    linkedin: profile?.linkedin || "",
    portfolio: profile?.portfolio || "",
    website: profile?.website || "",
    preferredBudgetMin: profile?.preferredBudgetMin?.toString() || "",
    preferredBudgetMax: profile?.preferredBudgetMax?.toString() || "",
    preferredCategories: profile?.preferredCategories || [],
  });

  // Debounced Auto-save for Step 1, 2, 5
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (step === 1) {
        try {
          await freelancerService.updateOnboardingStep1({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            location: formData.location,
            region: formData.region,
            tagline: formData.tagline,
          });
        } catch (e) {
          console.error("Auto-save Step 1 failed", e);
        }
      } else if (step === 2) {
        try {
          await freelancerService.updateOnboardingStep2({
            hourlyRate: Number(formData.hourlyRate),
            bio: formData.bio,
            availability: formData.availability,
            experienceLevel: formData.experienceLevel,
            preferredBudgetMin: formData.preferredBudgetMin ? Number(formData.preferredBudgetMin) : undefined,
            preferredBudgetMax: formData.preferredBudgetMax ? Number(formData.preferredBudgetMax) : undefined,
          });
        } catch (e) {
          console.error("Auto-save Step 2 failed", e);
        }
      } else if (step === 3) {
        try {
          await freelancerService.updateOnboardingStep3({
            skills: formData.skills,
            education: formData.educations.filter(
              (e: any) => e.school && e.degree,
            ),
            languages: formData.languages,
          });
        } catch (e) {
          console.error("Auto-save Step 3 failed", e);
        }
      } else if (step === 5) {
        try {
          await freelancerService.updateOnboardingStep5({
            github: formData.github,
            linkedin: formData.linkedin,
            portfolio: formData.portfolio,
            website: formData.website,
          });
        } catch (e) {
          console.error("Auto-save Step 5 failed", e);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, step]);

  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState("3");
  const [certifications, setCertifications] = useState<any[]>(
    profile?.certificates || [],
  );
  const [gigs, setGigs] = useState<any[]>(profile?.gigs || []);

  const [files, setFiles] = useState<{
    profileImage: File | null;
    certFiles: (File | null)[];
    gigFiles: (File | null)[];
  }>({
    profileImage: null,
    certFiles: [null, null, null, null],
    gigFiles: [null, null, null, null],
  });

  // Live completion — recomputed every time formData / files / existing data changes
  const localCompletion = useMemo(
    () =>
      computeLocalCompletion(
        formData,
        files,
        profile?.user?.profileImage,
        certifications,
        gigs,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, files.profileImage, certifications.length, gigs.length],
  );

  const TABS = [
    {
      id: 1,
      label: "Personal",
      icon: User,
      weight: WEIGHTS.nameTagline + WEIGHTS.phone + WEIGHTS.location,
      isComplete: !!(
        formData.fullName?.trim().length >= 3 &&
        formData.tagline?.trim().length >= 10 &&
        formData.location
      ),
    },
    {
      id: 2,
      label: "Professional",
      icon: Briefcase,
      weight: WEIGHTS.hourlyRate + WEIGHTS.bio + WEIGHTS.experienceLevel + WEIGHTS.budget,
      isComplete: !!(
        Number(formData.hourlyRate) >= 5 &&
        formData.bio?.trim().length >= 100 &&
        Number(formData.preferredBudgetMin) > 0 &&
        Number(formData.preferredBudgetMax) > 0
      ),
    },
    {
      id: 3,
      label: "Skills & Edu",
      icon: Sparkles,
      weight: WEIGHTS.skills + WEIGHTS.languages + WEIGHTS.education,
      isComplete: formData.skills.length > 0,
    },
    {
      id: 4,
      label: "Media",
      icon: Upload,
      weight: WEIGHTS.profileImage + WEIGHTS.portfolio,
      isComplete: !!(profile?.user?.profileImage || files.profileImage),
    },
    {
      id: 5,
      label: "Links",
      icon: Globe,
      weight: WEIGHTS.links,
      isComplete: !!(
        formData.github?.trim() ||
        formData.linkedin?.trim() ||
        formData.portfolio?.trim() ||
        formData.website?.trim()
      ),
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async () => {
    // Basic Validation
    if (step === 1) {
      const phoneNumber = parsePhoneNumberFromString(formData.phoneNumber);
      if (!formData.fullName || formData.fullName.length < 3) {
        toast.error("Full name must be at least 3 characters.");
        return;
      }
      if (!formData.tagline || formData.tagline.length < 10) {
        toast.error("Tagline must be at least 10 characters.");
        return;
      }
      if (!formData.phoneNumber || !phoneNumber || !phoneNumber.isValid()) {
        toast.error("Please enter a valid international phone number.");
        return;
      }
      if (!formData.location) {
        toast.error("Please select your country.");
        return;
      }
    } else if (step === 3) {
      if (formData.skills.length === 0) {
        toast.error("Please add at least one skill.");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (step === 1) {
        await freelancerService.updateOnboardingStep1({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          region: formData.region,
          tagline: formData.tagline,
        });
      } else if (step === 2) {
        await freelancerService.updateOnboardingStep2({
          hourlyRate: Number(formData.hourlyRate),
          bio: formData.bio,
          availability: formData.availability,
          experienceLevel: formData.experienceLevel,
          preferredBudgetMin: formData.preferredBudgetMin ? Number(formData.preferredBudgetMin) : undefined,
          preferredBudgetMax: formData.preferredBudgetMax ? Number(formData.preferredBudgetMax) : undefined,
        });
      } else if (step === 3) {
        await freelancerService.updateOnboardingStep3({
          skills: formData.skills,
          education: formData.educations.filter(
            (e: any) => e.school && e.degree,
          ),
          languages: formData.languages,
          preferredCategories: formData.preferredCategories,
        });
      } else if (step === 4) {
        if (!files.profileImage && !profile?.user?.profileImage) {
          toast.error("Please upload a profile picture.");
          setIsLoading(false);
          return;
        }
        const formPayload = new FormData();
        if (files.profileImage)
          formPayload.append("profileImage", files.profileImage);

        files.certFiles.forEach((file, i) => {
          if (file) {
            formPayload.append("certFiles", file);
            formPayload.append(
              "certTitles",
              certifications[i]?.title || `Certificate ${i + 1}`,
            );
          }
        });

        files.gigFiles.forEach((file, i) => {
          if (file) {
            formPayload.append("gigFiles", file);
            formPayload.append("gigTitles", gigs[i]?.title || `Gig ${i + 1}`);
          }
        });

        await freelancerService.uploadOnboardingFiles(formPayload);
      } else if (step === 5) {
        await freelancerService.updateOnboardingStep5({
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          website: formData.website,
          preferredCategories: formData.preferredCategories,
        });
        toast.success("Profile Updated!", {
          description: "Your changes have been saved.",
        });
        // Don't close immediately if they want to keep editing tabs
        // onComplete();
        // return;
      }

      if (step < 5) {
        setStep((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      const message =
        error.response?.data?.message ||
        "Failed to save details. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = async (name: string) => {
    if (!name.trim()) return;
    if (formData.skills.length >= 10) {
      toast.error("You can add a maximum of 10 skills.");
      return;
    }
    if (
      formData.skills.some(
        (s: any) => s.name.toLowerCase() === name.toLowerCase(),
      )
    )
      return;

    const newSkills = [
      ...formData.skills,
      { name: name.trim(), level: parseInt(skillLevel) },
    ];
    setFormData((prev) => ({ ...prev, skills: newSkills }));
    setSkillInput("");

    // Immediate Auto-save
    try {
      await freelancerService.updateOnboardingStep3({
        skills: newSkills,
        education: formData.educations.filter((e: any) => e.school && e.degree),
        languages: formData.languages,
      });
    } catch (e) {
      console.error("Auto-save skills failed", e);
    }
  };

  const removeSkill = async (name: string) => {
    const newSkills = formData.skills.filter((s: any) => s.name !== name);
    setFormData((prev) => ({ ...prev, skills: newSkills }));

    // Immediate Auto-save
    try {
      await freelancerService.updateOnboardingStep3({
        skills: newSkills,
        education: formData.educations.filter((e: any) => e.school && e.degree),
        languages: formData.languages,
      });
    } catch (e) {
      console.error("Auto-save remove skill failed", e);
    }
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        { school: "", degree: "", year: "", level: "University" },
      ],
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEdus = [...formData.educations];
    newEdus[index] = { ...newEdus[index], [field]: value };
    setFormData((prev) => ({ ...prev, educations: newEdus }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: phone }));

    // Auto-detect country and region from phone number
    if (phone.startsWith("+")) {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (phoneNumber && phoneNumber.isValid()) {
        const countryCode = phoneNumber.countryCallingCode;
        const matchedLocation = locations.find(
          (loc) => loc.phoneCode === countryCode,
        );
        if (matchedLocation) {
          setFormData((prev) => ({
            ...prev,
            location: matchedLocation.name,
            region: matchedLocation.region || "",
          }));
          toast.success(`Location detected as ${matchedLocation.name}`);
        }
      }
    }
  };

  const addLanguage = async (name: string) => {
    if (!name) return;
    if (formData.languages.length >= 3) {
      toast.error("You can add a maximum of 3 languages.");
      return;
    }
    if (
      formData.languages.some(
        (l: any) => (typeof l === "string" ? l : l.name) === name,
      )
    )
      return;
    const newLangs = [...formData.languages, { name }];
    setFormData((prev) => ({
      ...prev,
      languages: newLangs,
    }));

    // Immediate Auto-save
    try {
      await freelancerService.updateOnboardingStep3({
        skills: formData.skills,
        education: formData.educations.filter((e: any) => e.school && e.degree),
        languages: newLangs,
      });
    } catch (e) {
      console.error("Auto-save add language failed", e);
    }
  };

  const removeLanguage = async (index: number) => {
    const newLangs = formData.languages.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData((prev) => ({ ...prev, languages: newLangs }));

    // Immediate Auto-save
    try {
      await freelancerService.updateOnboardingStep3({
        skills: formData.skills,
        education: formData.educations.filter((e: any) => e.school && e.degree),
        languages: newLangs,
      });
    } catch (e) {
      console.error("Auto-save remove language failed", e);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background flex flex-col">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-foreground">
                Complete Your Profile
              </DialogTitle>
              <DialogDescription className="text-xs font-medium">
                Fill in your details to reach 100% and start bidding.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="w-3 h-3" />
                <span>{localCompletion}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${localCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-1 bg-accent/30 p-1 rounded-2xl mt-4 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const isActive = step === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setStep(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative",
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                  )}
                >
                  <t.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {t.label}
                  {t.isComplete && !isActive && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-background shadow-sm">
                      <CheckCircle2 className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex w-full items-center">Full Name <WeightBadge pct={WEIGHTS.nameTagline} isComplete={formData.fullName?.trim().length >= 3 && formData.tagline?.trim().length >= 10} /></Label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Tagline</Label>
                <Input
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="Senior Full Stack Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex w-full items-center">Phone Number <WeightBadge pct={WEIGHTS.phone} isComplete={!!formData.phoneNumber?.trim()} /></Label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+92 300 1234567"
                  className={cn(
                    "rounded-xl",
                    formData.phoneNumber &&
                      !parsePhoneNumberFromString(
                        formData.phoneNumber,
                      )?.isValid() &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <p className="text-[10px] text-muted-foreground">
                  Format: +CountryCode Number (e.g. +92...)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex w-full items-center">Country <WeightBadge pct={WEIGHTS.location} isComplete={!!formData.location?.trim()} /></Label>
                  <Select
                    onValueChange={(val) => {
                      const country = (locations || []).find(
                        (c: any) => c.name === val,
                      ) as any;
                      setFormData((p) => ({
                        ...p,
                        location: val,
                        region: country?.region || "",
                      }));
                    }}
                    value={formData.location}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {(locations || []).map((c: any) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region (Auto-filled)</Label>
                  <Input
                    disabled
                    value={formData.region}
                    placeholder="Auto-detected"
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex w-full items-center">Hourly Rate ($) <WeightBadge pct={WEIGHTS.hourlyRate} isComplete={Number(formData.hourlyRate) >= 5} /></Label>
                <Input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex w-full items-center">Professional Bio <WeightBadge pct={WEIGHTS.bio} isComplete={formData.bio?.trim().length >= 100} /></Label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell clients about yourself..."
                  className="h-32"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex w-full items-center">Experience Level <WeightBadge pct={WEIGHTS.experienceLevel} isComplete={!!formData.experienceLevel} /></Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, experienceLevel: val }))
                    }
                    value={formData.experienceLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Intermediate</SelectItem>
                      <SelectItem value="SENIOR">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, availability: val }))
                    }
                    value={formData.availability}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="UNAVAILABLE">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    Preferred Project Budget Range ($)
                    <WeightBadge pct={WEIGHTS.budget} isComplete={Number(formData.preferredBudgetMin) > 0 && Number(formData.preferredBudgetMax) > 0} />
                  </Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Minimum Budget</Label>
                    <Input
                      type="number"
                      name="preferredBudgetMin"
                      value={formData.preferredBudgetMin}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Maximum Budget</Label>
                    <Input
                      type="number"
                      name="preferredBudgetMax"
                      value={formData.preferredBudgetMax}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  This helps us recommend projects that fit your expectations.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Your Skills &
                  Expertise
                  <WeightBadge pct={WEIGHTS.skills} isComplete={formData.skills.length > 0} />
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[100px] p-4 border rounded-2xl bg-muted/5 shadow-inner overflow-y-auto max-h-[200px]">
                  {formData.skills.map((s: any) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between p-3 bg-card border rounded-xl shadow-sm group hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm">{s.name}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1 w-3 rounded-full transition-colors",
                                i <= s.level ? "bg-primary" : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        onClick={() => removeSkill(s.name)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.skills.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-4">
                      <p className="text-sm italic opacity-50">
                        No skills added yet
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end bg-card p-4 border rounded-2xl shadow-sm">
                  <div className="flex-1 space-y-2 w-full">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Skill Name
                    </Label>
                    <SkillAutocomplete
                      value={skillInput}
                      onChange={setSkillInput}
                      onSelect={(skillName) => {
                        addSkill(skillName);
                      }}
                      placeholder="e.g. React, Python, UI Design"
                      className="[&_.relative>input]:rounded-xl [&_.relative>input]:h-11 [&_.relative>input]:border-none [&_.relative>input]:bg-muted/50 [&_.relative>input]:focus-visible:ring-primary"
                    />
                  </div>
                  <div className="w-full sm:w-32 space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Level
                    </Label>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger className="rounded-xl h-11 border-none bg-muted/50">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Beginner</SelectItem>
                        <SelectItem value="2">Elementary</SelectItem>
                        <SelectItem value="3">Intermediate</SelectItem>
                        <SelectItem value="4">Advanced</SelectItem>
                        <SelectItem value="5">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    className="h-11 rounded-xl px-4 font-bold shadow-lg shadow-primary/20"
                    onClick={() => addSkill(skillInput)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between pt-2">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    Education
                    <WeightBadge pct={WEIGHTS.education} isComplete={formData.educations.some((e: any) => e.school?.trim() && e.degree?.trim())} />
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addEducation}
                    className="text-primary font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add More
                  </Button>
                </div>

                {formData.educations.map((edu: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-xl space-y-4 relative group bg-card shadow-sm"
                  >
                    {idx > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEducation(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Level / Class</Label>
                        <Select
                          onValueChange={(val) =>
                            updateEducation(idx, "level", val)
                          }
                          value={edu.level}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="School">
                              School (Class 1-10)
                            </SelectItem>
                            <SelectItem value="College">
                              College (High School / Inter)
                            </SelectItem>
                            <SelectItem value="University">
                              University (Bachelor+)
                            </SelectItem>
                            <SelectItem value="Other">
                              Other Certification
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Graduation Year</Label>
                        <Input
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation(idx, "year", e.target.value)
                          }
                          placeholder="2024"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>School / University Name</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) =>
                          updateEducation(idx, "school", e.target.value)
                        }
                        placeholder="E.g. FAST NUCES"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree / Major</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(idx, "degree", e.target.value)
                        }
                        placeholder="E.g. BS in Computer Science"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold flex items-center gap-2">Languages <WeightBadge pct={WEIGHTS.languages} isComplete={formData.languages.length > 0} /></Label>
                  {formData.languages.length < 3 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      You can add {3 - formData.languages.length} more
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((l: any, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="px-3 py-1 gap-2 bg-primary/5 border-primary/20"
                    >
                      {typeof l === "string" ? l : l.name}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeLanguage(i)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {(metadataLanguages || []).map((l: any) => (
                      <SelectItem key={l.id} value={l.name}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Categories */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-lg font-bold flex items-center gap-2">
                    {/* <Heart className="w-5 h-5 text-purple-500 fill-purple-500" /> */}
                    Preferred Categories
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Select categories you're most interested in to get better
                    matching projects.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat: any) => {
                    const isSelected = formData.preferredCategories.includes(
                      cat.slug,
                    );
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (
                            !isSelected &&
                            formData.preferredCategories.length >= 4
                          ) {
                            toast.error("You can select a maximum of 4 preferred categories.");
                            return;
                          }
                          setFormData((prev) => ({
                            ...prev,
                            preferredCategories: isSelected
                              ? prev.preferredCategories.filter(
                                  (s: string) => s !== cat.slug,
                                )
                              : [...prev.preferredCategories, cat.slug],
                          }));
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border text-left",
                          isSelected
                            ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
                            : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                            isSelected
                              ? "bg-purple-500 border-purple-500"
                              : "bg-white border-slate-200",
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="space-y-4 w-full max-w-sm">
                  <Label className="text-sm font-bold flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> Profile Picture
                    <WeightBadge pct={WEIGHTS.profileImage} isComplete={!!(files.profileImage || profile?.user?.profileImage)} />
                  </Label>
                  {/* If user already has a profile image (e.g. from Google/OAuth), show preview */}
                  {profile?.user?.profileImage && !files.profileImage ? (
                    <div className="flex flex-col items-center gap-4 p-8 border-2 border-emerald-100 bg-emerald-50/50 rounded-[2.5rem] transition-all duration-300">
                      <div className="relative group">
                        <img
                          src={profile.user.profileImage}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-white shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black text-emerald-700">Already uploaded</p>
                        <label className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary cursor-pointer hover:underline transition-all">
                          <Pencil className="w-3.5 h-3.5" /> Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setFiles((p) => ({
                                ...p,
                                profileImage: e.target.files?.[0] || null,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-8 gap-4 hover:bg-muted/30 transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[180px]">
                      {files.profileImage ? (
                        <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                          <img
                            src={URL.createObjectURL(files.profileImage)}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-2xl"
                          />
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            {files.profileImage.name}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2 transition-transform duration-300 group-hover:scale-110">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-black">Click to upload photo</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && file.size > 10 * 1024 * 1024) {
                            toast.error("Profile image exceeds 10MB limit.");
                            return;
                          }
                          setFiles((p) => ({
                            ...p,
                            profileImage: file,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold flex w-full items-center">
                    Certifications (Max 4 Total)
                    <WeightBadge pct={WEIGHTS.portfolio} isComplete={certifications.length > 0 || gigs.length > 0 || !!formData.portfolio?.trim()} />
                  </Label>
                  {profile?.certificates?.length +
                    certifications.filter((c) => c.file).length <
                    4 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      You can upload {4 - (profile?.certificates?.length || 0)}{" "}
                      more
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => {
                    const existingCert = profile?.certificates?.[i];
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col gap-2 p-3 border rounded-xl bg-card transition-all",
                          existingCert &&
                            "opacity-60 bg-muted/30 grayscale-[50%]",
                        )}
                      >
                        <Input
                          placeholder="Cert Title"
                          value={
                            existingCert
                              ? existingCert.title
                              : certifications[i]?.title || ""
                          }
                          disabled={!!existingCert}
                          onChange={(e) => {
                            const newCerts = [...certifications];
                            newCerts[i] = {
                              ...newCerts[i],
                              title: e.target.value,
                            };
                            setCertifications(newCerts);
                          }}
                        />
                        <div className="relative h-10 border border-dashed rounded flex items-center justify-center bg-muted/30">
                          {existingCert ? (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                              <CheckCircle2 className="w-3 h-3" /> Already
                              Uploaded
                            </div>
                          ) : files.certFiles[i] ? (
                            <span className="text-[10px] font-bold truncate px-2">
                              {files.certFiles[i]?.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              Upload File
                            </span>
                          )}
                          {!existingCert && (
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file && file.size > 10 * 1024 * 1024) {
                                  toast.error("Certificate file exceeds 10MB limit.");
                                  return;
                                }
                                const newFiles = [...files.certFiles];
                                newFiles[i] = file;
                                setFiles((p) => ({
                                  ...p,
                                  certFiles: newFiles,
                                }));
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">
                    Gigs / Portfolios (Max 4 Total)
                  </Label>
                  {profile?.gigs?.length + gigs.filter((g) => g.file).length <
                    4 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      You can upload {4 - (profile?.gigs?.length || 0)} more
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => {
                    const existingGig = profile?.gigs?.[i];
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col gap-2 p-3 border rounded-xl bg-card transition-all",
                          existingGig &&
                            "opacity-60 bg-muted/30 grayscale-[50%]",
                        )}
                      >
                        <Input
                          placeholder="Project Title"
                          value={
                            existingGig
                              ? existingGig.title
                              : gigs[i]?.title || ""
                          }
                          disabled={!!existingGig}
                          onChange={(e) => {
                            const newGigs = [...gigs];
                            newGigs[i] = {
                              ...newGigs[i],
                              title: e.target.value,
                            };
                            setGigs(newGigs);
                          }}
                        />
                        <div className="relative h-10 border border-dashed rounded flex items-center justify-center bg-muted/30">
                          {existingGig ? (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                              <CheckCircle2 className="w-3 h-3" /> Already
                              Uploaded
                            </div>
                          ) : files.gigFiles[i] ? (
                            <span className="text-[10px] font-bold truncate px-2">
                              {files.gigFiles[i]?.name}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              Upload Preview
                            </span>
                          )}
                          {!existingGig && (
                            <Input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file && file.size > 10 * 1024 * 1024) {
                                  toast.error("Portfolio file exceeds 10MB limit.");
                                  return;
                                }
                                const newFiles = [...files.gigFiles];
                                newFiles[i] = file;
                                setFiles((p) => ({ ...p, gigFiles: newFiles }));
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex w-full items-center">Portfolio Link (or any link) <WeightBadge pct={WEIGHTS.links} isComplete={!!(formData.github?.trim() || formData.linkedin?.trim() || formData.portfolio?.trim() || formData.website?.trim())} /></Label>
                <Input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://myportfolio.com"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Personal Website</Label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://mywebsite.com"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((p) => p - 1)}
                disabled={isLoading}
                className="rounded-xl px-6"
              >
                Previous Section
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-6 font-bold text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {step === 5 ? "Save Changes" : "Save & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
