import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  Code2,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  MousePointer2,
  Zap,
  UploadCloud,
  Globe2,
  Languages,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { useMetadata } from "@/hooks/useMetadata";

const SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "UI/UX",
  "MongoDB",
  "AWS",
  "Tailwind CSS",
  "Next.js",
  "Solidity",
];

const VALIDATION = {
  title: { min: 5, max: 80 },
  shortDesc: { min: 10, max: 120 },
  fullDesc: { min: 30, max: 2000 },
  functionalReq: { min: 20, max: 2000 },
  skill: { min: 2, max: 30 },
};

const PostProjectPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // ✅ Load categories from DB
  const { categories, loading: catsLoading } = useCategories();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "", // ✅ now stores DB id
    subCategoryId: "", // ✅ now stores DB id
    shortDesc: "",
    fullDesc: "",
    functionalReq: "",
    referenceLinks: "",
    files: [] as File[],
    budget: 0,
    budgetType: "fixed",
    projectSize: "medium",
    skills: [] as string[],
    experienceLevel: "intermediate",
    hiringMethod: "bidding",
    deadline: undefined as Date | undefined,
    language: "English",
    locationPref: "Any location",
    languageId: "",
    locationId: "",
    termsAccepted: false,
  });

  const [customSkill, setCustomSkill] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // ── Pre-fill form when navigating from Drafts page ──
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const urlDraftId = searchParams.get("draftId");
    if (!urlDraftId) return;

    setDraftId(urlDraftId);
    api
      .get(`/projects/${urlDraftId}`)
      .then((res) => {
        const d = res.data.project;
        const sizeMap: Record<string, string> = {
          SMALL: "small",
          MEDIUM: "medium",
          LARGE: "large",
        };
        // Skills come back as projectSkill[] with nested skill.name
        const skillNames: string[] =
          d.skills
            ?.map((ps: any) => ps.skill?.name ?? ps.name ?? "")
            .filter(Boolean) ?? [];

        setFormData((prev) => ({
          ...prev,
          title: d.title ?? prev.title,
          categoryId: d.categoryId ?? prev.categoryId,
          subCategoryId: d.subCategoryId ?? prev.subCategoryId,
          shortDesc: d.shortDesc ?? prev.shortDesc,
          fullDesc: d.description ?? prev.fullDesc,
          functionalReq: d.requirements ?? prev.functionalReq,
          referenceLinks: d.referenceLinks ?? prev.referenceLinks,
          budget: d.budget ?? prev.budget,
          budgetType: d.budgetType ?? prev.budgetType,
          projectSize: sizeMap[d.size] ?? prev.projectSize,
          deadline: d.deadline ? new Date(d.deadline) : prev.deadline,
          skills: skillNames.length ? skillNames : prev.skills,
          experienceLevel: d.experienceLevel ?? prev.experienceLevel,
          hiringMethod: d.hiringMethod ?? prev.hiringMethod,
          language: d.language ?? prev.language,
          locationPref: d.locationPref ?? prev.locationPref,
        }));
      })
      .catch(() => toast.error("Failed to load draft data"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Load metadata (languages/locations) from DB
  const { languages, locations, loading: metaLoading } = useMetadata();

  // ✅ Helper to get selected category object
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  // ✅ Helper to get selected subcategory object
  const selectedSubCategory = selectedCategory?.subCategories.find(
    (s) => s.id === formData.subCategoryId,
  );

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          formData.title.length >= VALIDATION.title.min &&
          formData.title.length <= VALIDATION.title.max &&
          formData.shortDesc.length >= VALIDATION.shortDesc.min &&
          formData.shortDesc.length <= VALIDATION.shortDesc.max &&
          !!formData.categoryId &&
          !!formData.subCategoryId
        );
      case 2:
        return (
          formData.fullDesc.length >= VALIDATION.fullDesc.min &&
          formData.fullDesc.length <= VALIDATION.fullDesc.max &&
          formData.functionalReq.length >= VALIDATION.functionalReq.min &&
          formData.functionalReq.length <= VALIDATION.functionalReq.max
        );
      case 3:
        return !!formData.deadline && formData.budget > 0;
      case 4:
        return formData.skills.length > 0;
      case 5:
        return formData.termsAccepted;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(s + 1, 5));
  };

  const prevStep = () => {
    setShowErrors(false);
    setStep((s) => Math.max(s - 1, 1));
  };

  const goToStep = (s: number) => {
    setShowErrors(false);
    setStep(s);
  };

  const handleSaveDraft = async () => {
    if (!formData.title) {
      toast.error("Please add a project title before saving draft.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        categoryId: formData.categoryId || null,
        subCategoryId: formData.subCategoryId || null,
        shortDesc: formData.shortDesc,
        description: formData.fullDesc || "Draft - description pending",
        requirements: formData.functionalReq || "",
        budget: formData.budget || 0,
        budgetType: formData.budgetType,
        projectSize: formData.projectSize,
        deadline:
          formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        hiringMethod: formData.hiringMethod,
        language: formData.language,
        locationPref: formData.locationPref,
        languageId: formData.languageId || null,
        locationId: formData.locationId || null,
        status: "DRAFT",
      };

      let res;
      if (draftId) {
        res = await api.patch(`/projects/${draftId}`, payload);
        toast.info("Draft updated ✓");
      } else {
        res = await api.post("/projects", payload);
        setDraftId(res.data.project.id);
        toast.success("Draft saved!", {
          description: "Continue anytime from your Drafts.",
        });
      }

      navigate("/client/drafts");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Basics" },
    { id: 2, name: "Description" },
    { id: 3, name: "Budget" },
    { id: 4, name: "Skills" },
    { id: 5, name: "Review" },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-background/50 p-4 md:p-10">
        <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Badge
              variant="outline"
              className="px-3 py-1 border-primary/20 bg-primary/5 text-primary"
            >
              SkillBridge Project Builder
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Post a New Project
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              Find the best talent by defining your project clearly.
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="bg-card/30 backdrop-blur-md rounded-2xl border-[0.5px] border-black p-6 md:p-8 shadow-sm">
            <div className="relative">
              <div className="flex justify-between items-center relative z-10">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 border-2",
                        step >= s.id
                          ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                          : "bg-background border-muted text-muted-foreground",
                      )}
                    >
                      {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        step >= s.id ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-muted -z-0" />
              <div
                className="absolute top-5 left-10 h-0.5 bg-primary transition-all duration-500 ease-in-out -z-0"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 95}%` }}
              />
            </div>
          </div>

          <div className="animate-fade-up">
            {/* ─────────────────────────────────────────
                Step 1: Basics
            ───────────────────────────────────────── */}
            {step === 1 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Project Basics</CardTitle>
                  <CardDescription>
                    Start with a clear title and category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Project Title *
                    </label>
                    <Input
                      placeholder="e.g., E-commerce App Redesign"
                      value={formData.title}
                      onChange={(e) => {
                        if (e.target.value.length <= VALIDATION.title.max)
                          updateFormData({ title: e.target.value });
                      }}
                      className="h-12 text-lg focus-visible:ring-primary/30"
                    />
                    <div className="flex justify-between items-center pt-1">
                      {showErrors &&
                      formData.title.length < VALIDATION.title.min ? (
                        <p className="text-[11px] text-destructive font-medium">
                          Must be at least {VALIDATION.title.min} characters
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {formData.title.length} / {VALIDATION.title.max}
                      </p>
                    </div>
                  </div>

                  {/* Category + SubCategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ✅ Main Category — loaded from DB */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Main Category *
                      </label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(val) =>
                          updateFormData({ categoryId: val, subCategoryId: "" })
                        }
                        disabled={catsLoading}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue
                            placeholder={
                              catsLoading ? "Loading..." : "Select Category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showErrors && !formData.categoryId && (
                        <p className="text-[11px] text-destructive font-medium">
                          Please select a category
                        </p>
                      )}
                    </div>

                    {/* ✅ Sub Category — filtered from selected category */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Sub Category *
                      </label>
                      <Select
                        disabled={!formData.categoryId || catsLoading}
                        value={formData.subCategoryId}
                        onValueChange={(val) =>
                          updateFormData({ subCategoryId: val })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select Sub Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCategory?.subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {showErrors && !formData.subCategoryId && (
                        <p className="text-[11px] text-destructive font-medium">
                          Please select a sub category
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      One-line Summary *
                    </label>
                    <Input
                      placeholder="Capture attention in one sentence"
                      value={formData.shortDesc}
                      onChange={(e) => {
                        if (e.target.value.length <= VALIDATION.shortDesc.max)
                          updateFormData({ shortDesc: e.target.value });
                      }}
                      className="h-12"
                    />
                    <div className="flex justify-between items-center pt-1">
                      {showErrors &&
                      formData.shortDesc.length < VALIDATION.shortDesc.min ? (
                        <p className="text-[11px] text-destructive font-medium">
                          Must be at least {VALIDATION.shortDesc.min} characters
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {formData.shortDesc.length} / {VALIDATION.shortDesc.max}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between w-full pt-6 border-t items-center">
                  <Button
                    variant="ghost"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <FileText className="w-4 h-4" /> Save as Draft
                  </Button>
                  <div className="flex items-center gap-3">
                    {showErrors &&
                      (!formData.title ||
                        !formData.categoryId ||
                        !formData.subCategoryId) && (
                        <span className="text-sm font-medium text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Required fields
                          missing
                        </span>
                      )}
                    <Button onClick={nextStep} className="gap-2 px-8 h-12">
                      Next: Description <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* ─────────────────────────────────────────
                Step 2: Description
            ───────────────────────────────────────── */}
            {step === 2 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Project Description
                  </CardTitle>
                  <CardDescription>
                    Tell us your vision and requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Describe your vision *
                    </label>
                    <Textarea
                      placeholder="What's the big picture? Why are you building this?"
                      className="min-h-[120px] p-4"
                      value={formData.fullDesc}
                      onChange={(e) => {
                        if (e.target.value.length <= VALIDATION.fullDesc.max)
                          updateFormData({ fullDesc: e.target.value });
                      }}
                    />
                    <div className="flex justify-between items-center pt-1">
                      {showErrors &&
                      formData.fullDesc.length < VALIDATION.fullDesc.min ? (
                        <p className="text-[11px] text-destructive font-medium">
                          Must be at least {VALIDATION.fullDesc.min} characters
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {formData.fullDesc.length} / {VALIDATION.fullDesc.max}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Functional Requirements *
                    </label>
                    <Textarea
                      placeholder="List specific features or modules you need..."
                      className="min-h-[120px] p-4"
                      value={formData.functionalReq}
                      onChange={(e) => {
                        if (
                          e.target.value.length <= VALIDATION.functionalReq.max
                        )
                          updateFormData({ functionalReq: e.target.value });
                      }}
                    />
                    <div className="flex justify-between items-center pt-1">
                      {showErrors &&
                      formData.functionalReq.length <
                        VALIDATION.functionalReq.min ? (
                        <p className="text-[11px] text-destructive font-medium">
                          Must be at least {VALIDATION.functionalReq.min}{" "}
                          characters
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {formData.functionalReq.length} /{" "}
                        {VALIDATION.functionalReq.max}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      Reference Links{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Figma links, competitors, inspiration..."
                        className="pl-10"
                        value={formData.referenceLinks}
                        onChange={(e) =>
                          updateFormData({ referenceLinks: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      Attachments
                      <span className="text-xs font-normal text-muted-foreground">
                        (Upload files, optional)
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          if (!e.target.files) return;
                          const ALLOWED = [
                            "image/jpeg",
                            "image/png",
                            "application/pdf",
                          ];
                          const selected = Array.from(e.target.files);
                          const valid = selected.filter((f) =>
                            ALLOWED.includes(f.type),
                          );
                          const invalid = selected.filter(
                            (f) => !ALLOWED.includes(f.type),
                          );
                          if (invalid.length > 0)
                            toast.error(
                              `${invalid.length} file(s) skipped — only JPG, PNG and PDF are allowed.`,
                            );
                          if (valid.length > 0)
                            updateFormData({
                              files: [...formData.files, ...valid],
                            });
                          // reset so same file can be re-selected after removal
                          e.target.value = "";
                        }}
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-3" />
                        <span className="text-sm font-medium">
                          Click to upload files
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, PDF up to 10MB
                        </span>
                      </label>
                      {formData.files.length > 0 && (
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 justify-center">
                          {formData.files.map((file, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="gap-2 bg-background"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">
                                {file.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateFormData({
                                    files: formData.files.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  });
                                }}
                              >
                                <X className="w-3 h-3 hover:text-destructive" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between w-full pt-6 border-t items-center">
                  <Button variant="ghost" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                      className="gap-2 border-border/40 hidden md:flex"
                    >
                      <FileText className="w-4 h-4" /> Save as Draft
                    </Button>
                    {showErrors &&
                      (!formData.fullDesc || !formData.functionalReq) && (
                        <span className="text-sm font-medium text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Required fields
                          missing
                        </span>
                      )}
                    <Button onClick={nextStep} className="gap-2 px-8">
                      Next: Budget <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* ─────────────────────────────────────────
                Step 3: Budget & Timeline
            ───────────────────────────────────────── */}
            {step === 3 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Budget & Timeline</CardTitle>
                  <CardDescription>
                    Define your budget expectations and target deadline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold block text-center">
                      How do you want to pay?
                    </label>
                    <div className="flex justify-center p-1 bg-muted rounded-xl max-w-xs mx-auto">
                      {["fixed", "hourly"].map((type) => (
                        <button
                          key={type}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all capitalize",
                            formData.budgetType === type
                              ? "bg-background shadow-sm text-primary"
                              : "text-muted-foreground",
                          )}
                          onClick={() => updateFormData({ budgetType: type })}
                        >
                          {type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold block">
                      Budget Amount (US$)
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        $
                      </span>
                      <Input
                        type="number"
                        min="1"
                        value={formData.budget}
                        onChange={(e) =>
                          updateFormData({ budget: Number(e.target.value) })
                        }
                        className="w-full h-12 pl-8 text-lg font-mono focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold">
                        Project Size
                      </label>
                      <div className="flex flex-col gap-2">
                        {[
                          {
                            id: "small",
                            label: "Small",
                            desc: "1-2 weeks, clear tasks",
                          },
                          {
                            id: "medium",
                            label: "Medium",
                            desc: "1-2 months, feature set",
                          },
                          {
                            id: "large",
                            label: "Large",
                            desc: "3+ months, complex app",
                          },
                        ].map((size) => (
                          <button
                            key={size.id}
                            onClick={() =>
                              updateFormData({ projectSize: size.id })
                            }
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                              formData.projectSize === size.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-muted/50 hover:bg-muted/30",
                            )}
                          >
                            <div className="text-left">
                              <span
                                className={cn(
                                  "text-xs font-bold block",
                                  formData.projectSize === size.id
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {size.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {size.desc}
                              </span>
                            </div>
                            {formData.projectSize === size.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold">
                        Target Completion
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal",
                              !formData.deadline && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                            {formData.deadline
                              ? format(formData.deadline, "PPP")
                              : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.deadline}
                            onSelect={(d) => updateFormData({ deadline: d })}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 flex gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-700 leading-tight">
                          Setting a realistic deadline ensures higher quality
                          proposals.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between w-full pt-6 border-t items-center">
                  <Button variant="ghost" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                      className="gap-2 border-border/40 hidden md:flex"
                    >
                      <FileText className="w-4 h-4" /> Save as Draft
                    </Button>
                    {showErrors &&
                      (!formData.deadline || formData.budget <= 0) && (
                        <span className="text-sm font-medium text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Required fields
                          missing
                        </span>
                      )}
                    <Button onClick={nextStep} className="gap-2 px-8">
                      Next: Skills <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* ─────────────────────────────────────────
                Step 4: Skills & Preferences
            ───────────────────────────────────────── */}
            {step === 4 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Skills & Preferences
                  </CardTitle>
                  <CardDescription>
                    Specify the level of expertise you are looking for.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold">
                      Required Tech Stack
                    </label>
                    <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-muted/20 rounded-xl border border-dashed border-muted">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="skill"
                          className="pl-3 pr-1 py-1 h-8 text-sm gap-2"
                        >
                          {skill}
                          <button
                            onClick={() =>
                              updateFormData({
                                skills: formData.skills.filter(
                                  (s) => s !== skill,
                                ),
                              })
                            }
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {formData.skills.length === 0 && (
                        <span className="text-xs text-muted-foreground italic mt-1">
                          Add skills below...
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {SKILL_SUGGESTIONS.filter(
                        (s) => !formData.skills.includes(s),
                      )
                        .slice(0, 5)
                        .map((skill) => (
                          <button
                            key={skill}
                            onClick={() =>
                              updateFormData({
                                skills: [...formData.skills, skill],
                              })
                            }
                            className="text-[11px] bg-background hover:bg-muted py-1.5 px-3 rounded-full transition-colors border border-border/40 shrink-0"
                          >
                            + {skill}
                          </button>
                        ))}
                      <div className="flex flex-col gap-1">
                        <Input
                          placeholder="Type custom skill & press Enter..."
                          value={customSkill}
                          onChange={(e) => {
                            if (e.target.value.length <= VALIDATION.skill.max)
                              setCustomSkill(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customSkill.trim()) {
                              e.preventDefault();
                              const trimmed = customSkill.trim();
                              if (trimmed.length < VALIDATION.skill.min) {
                                toast.error(
                                  `Skill must be at least ${VALIDATION.skill.min} characters`,
                                );
                                return;
                              }
                              if (!formData.skills.includes(trimmed))
                                updateFormData({
                                  skills: [...formData.skills, trimmed],
                                });
                              setCustomSkill("");
                            }
                          }}
                          className="h-8 w-[240px] text-xs rounded-full border-dashed focus-visible:ring-primary/30"
                        />
                        <div className="flex justify-end w-[240px] pr-2">
                          <p className="text-[10px] text-muted-foreground">
                            {customSkill.length} / {VALIDATION.skill.max}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Languages className="w-4 h-4 text-muted-foreground" />{" "}
                        Communication Language
                      </label>
                      <Select
                        value={formData.languageId || formData.language}
                        onValueChange={(val) => {
                          const lang = languages.find((l) => l.id === val);
                          updateFormData({
                            languageId: val,
                            language: lang ? lang.name : val,
                          });
                        }}
                        disabled={metaLoading}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue
                            placeholder={
                              metaLoading
                                ? "Loading languages..."
                                : "Select Language"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.id} value={lang.id}>
                              {lang.name}
                            </SelectItem>
                          ))}
                          {languages.length === 0 && !metaLoading && (
                            <SelectItem value="English">English</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-muted-foreground" />{" "}
                        Freelancer Location
                      </label>
                      <Select
                        value={formData.locationId || formData.locationPref}
                        onValueChange={(val) => {
                          const loc = locations.find((l) => l.id === val);
                          updateFormData({
                            locationId: val,
                            locationPref: loc ? loc.name : val,
                          });
                        }}
                        disabled={metaLoading}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue
                            placeholder={
                              metaLoading
                                ? "Loading locations..."
                                : "Select Location Preference"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                          {locations.length === 0 && !metaLoading && (
                            <SelectItem value="Any location">
                              Any location
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold">
                        Experience Level
                      </label>
                      <div className="flex flex-col gap-2">
                        {[
                          {
                            id: "entry",
                            label: "Entry Level",
                            desc: "Great for simple tasks",
                          },
                          {
                            id: "intermediate",
                            label: "Intermediate",
                            desc: "Standard industrial quality",
                          },
                          {
                            id: "expert",
                            label: "Expert",
                            desc: "Premium architectural work",
                          },
                        ].map((exp) => (
                          <button
                            key={exp.id}
                            onClick={() =>
                              updateFormData({ experienceLevel: exp.id })
                            }
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                              formData.experienceLevel === exp.id
                                ? "border-primary bg-primary/5"
                                : "border-muted/50 hover:bg-muted/30",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                formData.experienceLevel === exp.id
                                  ? "border-primary"
                                  : "border-muted",
                              )}
                            >
                              {formData.experienceLevel === exp.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold block">
                                {exp.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {exp.desc}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-semibold">
                        Hiring Method
                      </label>
                      <Card className="bg-muted/20 border-border/40 overflow-hidden">
                        {[
                          {
                            id: "bidding",
                            icon: <MousePointer2 className="w-5 h-5" />,
                            label: "Open Bidding",
                            desc: "Receive proposals from anyone",
                          },
                          {
                            id: "direct",
                            icon: <Zap className="w-5 h-5" />,
                            label: "Direct Invite",
                            desc: "Invite specific developers only",
                          },
                        ].map((method, idx) => (
                          <button
                            key={method.id}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 text-left transition-all",
                              idx === 0 && "border-b border-border/40",
                              formData.hiringMethod === method.id
                                ? "bg-background"
                                : "opacity-60",
                            )}
                            onClick={() =>
                              updateFormData({ hiringMethod: method.id })
                            }
                          >
                            <span
                              className={cn(
                                formData.hiringMethod === method.id
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            >
                              {method.icon}
                            </span>
                            <div>
                              <span className="text-xs font-bold block">
                                {method.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {method.desc}
                              </span>
                            </div>
                            {formData.hiringMethod === method.id && (
                              <Check className="ml-auto w-4 h-4 text-primary" />
                            )}
                          </button>
                        ))}
                      </Card>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between w-full pt-6 border-t items-center">
                  <Button variant="ghost" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                      className="gap-2 border-border/40 hidden md:flex"
                    >
                      <FileText className="w-4 h-4" /> Save as Draft
                    </Button>
                    {showErrors && formData.skills.length === 0 && (
                      <span className="text-sm font-medium text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Add at least one
                        skill
                      </span>
                    )}
                    <Button onClick={nextStep} className="gap-2 px-8">
                      Final Review <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* ─────────────────────────────────────────
                Step 5: Review & Post
            ───────────────────────────────────────── */}
            {step === 5 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">
                    Review Your Project
                  </CardTitle>
                  <CardDescription>
                    Everything looks set to launch.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Basics */}
                    <div className="p-5 rounded-xl bg-muted/30 border border-border/40 relative group">
                      <button
                        onClick={() => goToStep(1)}
                        className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        EDIT
                      </button>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Basics
                      </h4>
                      <h2 className="text-xl font-bold mb-1">
                        {formData.title}
                      </h2>
                      {/* ✅ Show category name from DB object */}
                      <Badge variant="outline" className="mb-1">
                        {selectedCategory?.name ?? "—"}
                      </Badge>
                      {selectedSubCategory && (
                        <Badge variant="secondary" className="mb-3 ml-1">
                          {selectedSubCategory.name}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground italic mt-2">
                        "{formData.shortDesc}"
                      </p>
                    </div>

                    {/* Budget / Timeline */}
                    <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 relative group">
                      <button
                        onClick={() => goToStep(3)}
                        className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        EDIT
                      </button>
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                        Budget & Timeline
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">
                            ESTIMATED BUDGET
                          </span>
                          <span className="text-sm font-bold">
                            ${(formData.budget || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] block uppercase font-bold text-primary">
                            {formData.budgetType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">
                            DEADLINE
                          </span>
                          <span className="text-sm font-bold">
                            {formData.deadline
                              ? format(formData.deadline, "MMM d, yyyy")
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description & Requirements */}
                    <div className="p-5 rounded-xl bg-muted/30 border border-border/40 md:col-span-2 relative group">
                      <button
                        onClick={() => goToStep(2)}
                        className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        EDIT
                      </button>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Description &
                        Requirements
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold block mb-1">
                            VISION:
                          </span>
                          <p className="text-xs line-clamp-2 text-foreground/80 leading-relaxed">
                            {formData.fullDesc}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block mb-1">
                            FUNCTIONAL NEEDS:
                          </span>
                          <p className="text-xs line-clamp-2 text-foreground/80 leading-relaxed">
                            {formData.functionalReq}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="p-5 rounded-xl bg-muted/30 border border-border/40 md:col-span-2 relative group">
                      <button
                        onClick={() => goToStep(4)}
                        className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        EDIT
                      </button>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Code2 className="w-3 h-3" /> Tech Stack & Experience
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((s) => (
                          <Badge
                            key={s}
                            variant="skill"
                            className="bg-background"
                          >
                            {s}
                          </Badge>
                        ))}
                        <Badge
                          variant="secondary"
                          className="uppercase text-[9px] ml-auto"
                        >
                          {formData.experienceLevel} Level
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col md:flex-row gap-6 pt-6 border-t bg-muted/20 p-8">
                  <div className="flex-1 flex flex-col gap-3 pr-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        Launching this project will notify matching developers
                        immediately.
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) =>
                          updateFormData({ termsAccepted: checked === true })
                        }
                        className="mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm cursor-pointer leading-tight text-foreground/80"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and understand the{" "}
                        <Link
                          to="/privacy"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {showErrors && !formData.termsAccepted && (
                      <span className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-4 h-4" /> Please accept the
                        terms to post your project
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isLoading}
                      className="h-12 px-6 gap-2 border-border/40 flex-1 md:flex-none hidden lg:flex"
                    >
                      <FileText className="w-4 h-4" /> Save as Draft
                    </Button>
                    <Button
                      disabled={isLoading}
                      className="w-full md:w-auto min-w-[200px] h-12 text-lg font-black gap-3 shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex-1 md:flex-none"
                      onClick={async () => {
                        if (!formData.termsAccepted) {
                          setShowErrors(true);
                          return;
                        }

                        setIsLoading(true);
                        try {
                          const fd = new FormData();
                          fd.append("title", formData.title);
                          // ✅ send IDs to backend
                          fd.append("categoryId", formData.categoryId);
                          fd.append("subCategoryId", formData.subCategoryId);
                          fd.append("shortDesc", formData.shortDesc);
                          fd.append("description", formData.fullDesc);
                          fd.append("requirements", formData.functionalReq);
                          fd.append("referenceLinks", formData.referenceLinks);
                          fd.append("budget", String(formData.budget));
                          fd.append("budgetType", formData.budgetType);
                          fd.append("projectSize", formData.projectSize);
                          fd.append(
                            "deadline",
                            formData.deadline
                              ? formData.deadline.toISOString()
                              : "",
                          );
                          fd.append(
                            "experienceLevel",
                            formData.experienceLevel,
                          );
                          fd.append("hiringMethod", formData.hiringMethod);
                          fd.append("language", formData.language);
                          fd.append("locationPref", formData.locationPref);
                          if (formData.languageId)
                            fd.append("languageId", formData.languageId);
                          if (formData.locationId)
                            fd.append("locationId", formData.locationId);
                          fd.append("status", "OPEN");

                          formData.skills.forEach((skill) =>
                            fd.append("skills", skill),
                          );
                          formData.files.forEach((file) =>
                            fd.append("files", file),
                          );

                          let res;
                          if (draftId) {
                            res = await api.patch(`/projects/${draftId}`, fd, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                          } else {
                            res = await api.post("/projects", fd, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                          }

                          toast.success(
                            "Project is now live on SkillBridge! 🎉",
                          );
                          navigate("/client/projects");
                        } catch (err: any) {
                          toast.error(
                            err?.response?.data?.message ||
                              "Failed to post project",
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? "Posting..." : "Post Project"}
                      {!isLoading && <MousePointer2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostProjectPage;
