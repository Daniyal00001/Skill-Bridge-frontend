import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Loader2, X, Plus } from "lucide-react";
import { FreelancerCard, Freelancer } from "@/components/common/FreelancerCard";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { InviteFreelancerModal } from "@/components/modals/InviteFreelancerModal";
import { SkillAutocomplete } from "@/components/common/SkillAutocomplete";

const BrowseFreelancersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    freelancerId: string;
    freelancerName: string;
  }>({
    isOpen: false,
    freelancerId: "",
    freelancerName: "",
  });

  const fetchFreelancers = useCallback(
    async (pageIdx = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "10");
        params.set("page", pageIdx.toString());

        if (searchTerm) params.set("search", searchTerm);
        if (selectedSkills.length > 0)
          params.set("skills", selectedSkills.join(","));

        // Schema-aligned filters
        if (experienceLevel !== "all")
          params.set("experienceLevel", experienceLevel);
        // Only apply rate filter if provided
        if (minRate) params.set("minRate", minRate);
        if (maxRate) params.set("maxRate", maxRate);

        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const res = await api.get(`/freelancers?${params.toString()}`);
        setFreelancers(
          res.data.data.freelancers.map((f: any) => ({
            ...f,
            name: f.fullName,
            title: f.tagline,
            skills: f.skills.map((s: any) => s.skill.name),
            averageRating: f.averageRating,
            totalReviews: f.totalReviews,
            profileImage: f.user.profileImage,
            availability: f.availability, // Comes as enum from schema
          })),
        );
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error("Failed to fetch freelancers", err);
        toast.error("Failed to load freelancers");
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedSkills,
      experienceLevel,
      minRate,
      maxRate,
      sortBy,
      sortOrder,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFreelancers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFreelancers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchFreelancers(page);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setExperienceLevel("all");
    setMinRate("");
    setMaxRate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setSkillInput("");
  };

  const handleMessage = async (freelancer: Freelancer) => {
    try {
      const res = await api.post(`/freelancers/${freelancer.id}/message`);
      const chatRoomId = res.data.data.id;
      toast.success(`Chat started with ${freelancer.name}`);
      // Redirect to messages page with the room active
      window.location.href = `/client/messages?room=${chatRoomId}`;
    } catch (err) {
      toast.error("Could not start chat");
    }
  };

  const handleInvite = (freelancer: Freelancer) => {
    setInviteModal({
      isOpen: true,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Browse Freelancers
          </h1>
          <p className="text-muted-foreground font-medium">
            Find the right talent for your projects from our vetted community.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Simplified Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6 min-w-0 max-w-full">
            <div className="bg-card border border-border rounded-xl p-5 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  Clear
                </Button>
              </div>

              {/* Search */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Keywords..."
                    className="pl-9 h-10 text-sm bg-muted/30 border-border focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Skills
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-muted text-muted-foreground border-none px-2 py-0.5 text-[10px] flex items-center gap-1.5"
                      >
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="relative">
                    <SkillAutocomplete
                      value={skillInput}
                      onChange={setSkillInput}
                      onSelect={(val) => {
                        addSkill(val);
                        setSkillInput("");
                      }}
                      placeholder="Search skills..."
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Experience Level - Schema Enum */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Experience
                </label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger className="h-10 text-sm bg-muted/30 border-border">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="ENTRY">Entry Level</SelectItem>
                    <SelectItem value="MID">Intermediate</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rate Range */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Rate ($/hr)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1 bg-muted/30 border border-border rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <span className="text-[11px] font-bold text-muted-foreground/50">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-muted-foreground/30 font-medium">-</span>
                  <div className="flex-1 flex items-center gap-1 bg-muted/30 border border-border rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <span className="text-[11px] font-bold text-muted-foreground/50">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-[12px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 space-y-6 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Found{" "}
                <span className="text-foreground font-bold">
                  {pagination.total}
                </span>{" "}
                freelancers
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Sort:
                </span>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(val) => {
                    const [field, order] = val.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <SelectTrigger className="h-8 border-none bg-transparent hover:bg-accent text-xs font-bold w-[140px] px-2 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="hourlyRate-asc">Lowest Rate</SelectItem>
                    <SelectItem value="hourlyRate-desc">
                      Highest Rate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
                  Searching Professionals...
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {freelancers.map((freelancer) => (
                    <FreelancerCard
                      key={freelancer.id}
                      freelancer={freelancer}
                      onMessage={handleMessage}
                      onInvite={handleInvite}
                    />
                  ))}

                  {freelancers.length === 0 && (
                    <div className="text-center py-20 bg-card border border-border rounded-xl">
                      <p className="text-muted-foreground font-medium">
                        No results found for your search.
                      </p>
                      <Button
                        variant="link"
                        onClick={resetFilters}
                        className="mt-2 h-auto p-0 font-bold"
                      >
                        Reset all filters
                      </Button>
                    </div>
                  )}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(pagination.page - 1)
                            }
                            className={cn(
                              "cursor-pointer",
                              pagination.page === 1 &&
                                "pointer-events-none opacity-50",
                            )}
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1,
                        ).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={pagination.page === p}
                              onClick={() => handlePageChange(p)}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(pagination.page + 1)
                            }
                            className={cn(
                              "cursor-pointer",
                              pagination.page === pagination.totalPages &&
                                "pointer-events-none opacity-50",
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <InviteFreelancerModal
        isOpen={inviteModal.isOpen}
        onClose={() => setInviteModal((prev) => ({ ...prev, isOpen: false }))}
        freelancerId={inviteModal.freelancerId}
        freelancerName={inviteModal.freelancerName}
      />
    </DashboardLayout>
  );
};

export default BrowseFreelancersPage;
