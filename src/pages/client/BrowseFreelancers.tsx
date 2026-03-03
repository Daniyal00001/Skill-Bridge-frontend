import { useState, useMemo } from "react";
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
import { Search, Filter, MapPin, UserCheck, Star, Clock } from "lucide-react";
import { FreelancerCard } from "@/components/common/FreelancerCard";
import { mockFreelancers, Freelancer } from "@/lib/mockData";

const BrowseFreelancersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [rateRange, setRateRange] = useState([0, 200]);
  const [availability, setAvailability] = useState("all");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("best-match");

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    mockFreelancers.forEach((f) => f.skills.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, []);

  const filteredFreelancers = useMemo(() => {
    return mockFreelancers
      .filter((f) => {
        const matchesSearch =
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.skills.some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase()),
          );

        const matchesSkills =
          selectedSkills.length === 0 ||
          selectedSkills.every((s) => f.skills.includes(s));

        const matchesExperience = experienceLevel === "all" || true; // Mock: assuming all are Expert/Senior for now
        const matchesRate =
          f.hourlyRate >= rateRange[0] && f.hourlyRate <= rateRange[1];
        const matchesAvailability =
          availability === "all" || f.availability === availability;
        const matchesLocation =
          !location ||
          f.location.toLowerCase().includes(location.toLowerCase());

        return (
          matchesSearch &&
          matchesSkills &&
          matchesExperience &&
          matchesRate &&
          matchesAvailability &&
          matchesLocation
        );
      })
      .sort((a, b) => {
        if (sortBy === "lowest-rate") return a.hourlyRate - b.hourlyRate;
        if (sortBy === "highest-rated") return b.rating - a.rating;
        if (sortBy === "most-reviews") return b.reviewCount - a.reviewCount;
        return 0; // Best match (default)
      });
  }, [
    searchTerm,
    selectedSkills,
    experienceLevel,
    rateRange,
    availability,
    location,
    sortBy,
  ]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Browse Freelancers
            </h1>
            <p className="text-muted-foreground mt-1">
              Find the perfect talent for your next big project.
            </p>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skill, or title..."
              className="pl-10 h-12 bg-card border-muted-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-match">Best Match</SelectItem>
                <SelectItem value="lowest-rate">Lowest Rate</SelectItem>
                <SelectItem value="highest-rated">Highest Rated</SelectItem>
                <SelectItem value="most-reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6 bg-card p-6 rounded-xl border border-border/50 h-fit">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Filters</h3>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Skills</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {allSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={
                      selectedSkills.includes(skill) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <label className="text-sm font-medium">Experience Level</label>
              <Select
                value={experienceLevel}
                onValueChange={setExperienceLevel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Level</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Hourly Rate</label>
                <span className="text-xs font-mono">
                  ${rateRange[0]} - ${rateRange[1]}/hr
                </span>
              </div>
              <Slider
                defaultValue={[0, 200]}
                max={200}
                step={5}
                value={rateRange}
                onValueChange={setRateRange}
                className="py-2"
              />
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <label className="text-sm font-medium">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-10"
                  placeholder="Enter city or country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedSkills([]);
                setExperienceLevel("all");
                setRateRange([0, 200]);
                setAvailability("all");
                setLocation("");
              }}
            >
              Reset All Filters
            </Button>
          </div>

          {/* Freelancer Grid */}
          <div className="lg:col-span-3">
            {filteredFreelancers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredFreelancers.map((freelancer) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed text-center space-y-4">
                <div className="p-4 bg-primary/5 rounded-full">
                  <Search className="h-10 w-10 text-primary/40" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    No freelancers found
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                    We couldn't find any talent matching your current filters.
                    Try adjusting your search.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSkills([]);
                    setExperienceLevel("all");
                    setRateRange([0, 200]);
                    setAvailability("all");
                    setLocation("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseFreelancersPage;
