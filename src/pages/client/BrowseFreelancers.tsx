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

const BrowseFreelancersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [rateRange, setRateRange] = useState([0, 200]);
  const [maxRateLimit, setMaxRateLimit] = useState(200);
  const [availability, setAvailability] = useState("all");
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
        if (availability !== "all") params.set("availability", availability);

        // Only apply rate filter if intentionally changed from default [0, maxRateLimit]
        if (rateRange[0] !== 0 || rateRange[1] !== maxRateLimit) {
          params.set("minRate", rateRange[0].toString());
          params.set("maxRate", rateRange[1].toString());
        }

        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const res = await api.get(`/freelancers?${params.toString()}`);
        setFreelancers(
          res.data.data.freelancers.map((f: any) => ({
            ...f,
            name: f.fullName,
            title: f.tagline,
            skills: f.skills.map((s: any) => s.skill.name),
            rating: 5.0,
            reviewCount: 0,
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
      availability,
      rateRange,
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
    setRateRange([0, 200]);
    setAvailability("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setSkillInput("");
  };

  const handleMessage = async (freelancer: Freelancer) => {
    try {
      await api.post(`/freelancers/${freelancer.id}/message`);
      toast.success(`Chat started with ${freelancer.name}`);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Browse Freelancers
          </h1>
          <p className="text-slate-500 font-medium">
            Find the right talent for your projects from our vetted community.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Simplified Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 text-[11px] font-bold text-slate-500 hover:text-primary"
                >
                  Clear
                </Button>
              </div>

              {/* Search */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Keywords..."
                    className="pl-9 h-10 text-sm bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Skills
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 border-none px-2 py-0.5 text-[10px] flex items-center gap-1"
                      >
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="relative">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="Add skill..."
                      className="pl-8 h-9 text-xs bg-slate-50 border-slate-200"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && addSkill(skillInput)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Experience Level - Schema Enum */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Experience
                </label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200">
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
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Rate ($/hr)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <span className="text-[11px] font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={rateRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setRateRange([rateRange[0], val]);
                        if (val > maxRateLimit) setMaxRateLimit(val);
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val < rateRange[0]) setRateRange([val, val]);
                        setMaxRateLimit(Math.max(200, val));
                      }}
                      className="w-10 bg-transparent border-none p-0 text-[11px] font-bold text-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <Slider
                  defaultValue={[0, 200]}
                  max={maxRateLimit}
                  step={5}
                  value={rateRange}
                  onValueChange={setRateRange}
                  className="py-2"
                />
              </div>

              {/* Availability - Schema Enum */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Availability
                </label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="h-10 text-sm bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Status</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="BUSY">Busy</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                Found{" "}
                <span className="text-slate-900 font-bold">
                  {pagination.total}
                </span>{" "}
                freelancers
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  <SelectTrigger className="h-8 border-none bg-transparent hover:bg-slate-100 text-xs font-bold w-[140px] px-2">
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
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
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
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
                      <p className="text-slate-500 font-medium">
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
