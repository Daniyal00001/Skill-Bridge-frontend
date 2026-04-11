import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  BadgeCheck,
  Clock,
  Briefcase,
  ArrowRight,
  Zap,
  MessageSquare,
  UserPlus,
  Loader2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoredFreelancer } from "@/hooks/useBrowseFreelancers";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { InviteFreelancerModal } from "@/components/modals/InviteFreelancerModal";
import { formatDistanceToNow } from "date-fns";
import { getFreelancerLevel } from "@/lib/levelUtils";
import { LevelBadge } from "@/components/common/LevelBadge";

interface Props {
  freelancer: ScoredFreelancer;
  view?: "grid" | "list";
}

const EXP_COLORS: Record<string, string> = {
  ENTRY: "bg-slate-50 text-slate-500 border-slate-200",
  MID: "bg-blue-50 text-blue-600 border-blue-200",
  SENIOR: "bg-violet-50 text-violet-600 border-violet-200",
  EXPERT: "bg-amber-50 text-amber-600 border-amber-200",
};

const AVAILABILITY_CONFIG = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-400",
    text: "text-emerald-600",
  },
  BUSY: { label: "Busy", dot: "bg-amber-400", text: "text-amber-600" },
  UNAVAILABLE: {
    label: "Unavailable",
    dot: "bg-red-400",
    text: "text-red-500",
  },
};

export const FreelancerCard = ({ freelancer: f, view = "grid" }: Props) => {
  const [isMessaging, setIsMessaging] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const avail = AVAILABILITY_CONFIG[f.availability];
  const isVerified = !!f.user?.isIdVerified;
  const topSkills = f.skills?.slice(0, 4) ?? [];

  const lastActiveText = f.lastLoginAt 
    ? `Active ${formatDistanceToNow(new Date(f.lastLoginAt), { addSuffix: true })}`
    : "Recently active";

  const handleMessage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMessaging) return;
    setIsMessaging(true);
    try {
      const res = await api.post(`/freelancers/${f.id}/message`);
      const chatRoomId = res.data.data.id;
      toast.success("Chat initiated successfully");
      window.location.href = `/client/messages?room=${chatRoomId}`;
    } catch (err) {
      toast.error("Could not start chat");
      setIsMessaging(false);
    }
  };

  const handleInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInviteModalOpen(true);
  };

  if (view === "list") {
    return (
      <Card className="bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 rounded-2xl p-5 group">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {f.user?.profileImage ? (
                <img
                  src={f.user.profileImage}
                  alt={f.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                f.fullName?.charAt(0)?.toUpperCase()
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/client/freelancers/${f.id}`}
                className="text-sm font-bold text-slate-800 hover:text-blue-500 transition-colors group-hover:text-blue-500"
              >
                {f.fullName}
              </Link>
              {isVerified ? (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>ID Verified</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-300 border border-slate-200 px-1.5 rounded-md uppercase tracking-tighter">Unverified</span>
              )}
              <span
                className={cn(
                  "text-[10px] font-semibold border px-2 py-0.5 rounded-md",
                  EXP_COLORS[f.experienceLevel],
                )}
              >
                {f.experienceLevel}
              </span>
              <LevelBadge
                level={getFreelancerLevel({
                  totalEarnings: (f as any).totalEarnings ?? 0,
                  clientsCount: f.totalReviews ?? 0,
                  projectsCount: f.completedContracts ?? 0,
                  averageRating: f.averageRating ?? 0,
                })}
                size="xs"
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-[10px] font-semibold",
                  avail.text,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", avail.dot)} />
                {avail.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                <Clock className="w-3 h-3 text-slate-400" />
                {lastActiveText}
              </span>
            </div>

            {f.tagline && (
              <p className="text-xs text-slate-500 line-clamp-1">{f.tagline}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {topSkills.map((s) => (
                <span
                  key={s.skill.id}
                  className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-medium"
                >
                  {s.skill.name}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              {f.averageRating && (
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {f.averageRating.toFixed(1)}
                  <span className="text-slate-300">({f.totalReviews})</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {f.completedContracts} jobs
              </span>
              {f.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  {f.location}
                </span>
              )}
            </div>
          </div>

          {/* Right: rate + action */}
          <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
            <div className="text-right hidden sm:block">
              {f.hourlyRate ? (
                <>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                    Hourly Rate
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    ${f.hourlyRate}
                    <span className="text-xs font-normal text-slate-400">
                      /hr
                    </span>
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400">Rate not set</span>
              )}
              {f.matchPercentage > 0 && (
                <span
                  className={cn(
                    "block text-[10px] font-bold mt-0.5",
                    f.matchPercentage >= 70
                      ? "text-emerald-600"
                      : "text-amber-600",
                  )}
                >
                  {f.matchPercentage}% match
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-blue-100 text-blue-500 hover:bg-blue-50"
                onClick={handleMessage}
                disabled={isMessaging}
              >
                {isMessaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-blue-100 text-blue-500 hover:bg-blue-50"
                onClick={handleInvite}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
              <Link to={`/client/freelancers/${f.id}`}>
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-xl text-xs font-bold border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <InviteFreelancerModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          freelancerId={f.id}
          freelancerName={f.fullName}
        />
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="h-full bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/60 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group">
      {/* Top bar */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0">
            {f.user?.profileImage ? (
              <img
                src={f.user.profileImage}
                alt={f.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              f.fullName?.charAt(0)?.toUpperCase()
            )}
          </div>

          {/* Match + availability */}
          <div className="flex flex-col items-end gap-1">
            {f.matchPercentage > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                  f.matchPercentage >= 70
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-amber-600 bg-amber-50 border-amber-100",
                )}
              >
                {f.matchPercentage}% Match
              </span>
            )}
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold",
                avail.text,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", avail.dot)} />
              {avail.label}
            </span>
          </div>
        </div>

        {/* Name + verification */}
        <div className="flex items-center gap-1.5">
          <Link to={`/client/freelancers/${f.id}`}>
            <h3 className="text-sm font-bold text-slate-800 hover:text-blue-500 transition-colors line-clamp-1">
              {f.fullName}
            </h3>
          </Link>
          {isVerified ? (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
              <BadgeCheck className="w-3 h-3" />
              <span>ID Verified</span>
            </div>
          ) : (
            <span className="text-[9px] font-bold text-slate-300 border border-slate-200 px-1.5 rounded-md uppercase tracking-tighter">Unverified</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
            <Clock className="w-2.5 h-2.5" />
            {lastActiveText}
          </span>
        </div>

        {f.tagline && (
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            {f.tagline}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
        {/* Exp level + location */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-semibold border px-2 py-0.5 rounded-md",
              EXP_COLORS[f.experienceLevel],
            )}
          >
            {f.experienceLevel}
          </span>
          <LevelBadge
            level={getFreelancerLevel({
              totalEarnings: (f as any).totalEarnings ?? 0,
              clientsCount: f.totalReviews ?? 0,
              projectsCount: f.completedContracts ?? 0,
              averageRating: f.averageRating ?? 0,
            })}
            size="xs"
          />
          {f.location && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3 text-blue-400" />
              {f.location}
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((s) => (
            <span
              key={s.skill.id}
              className="text-[10px] font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-500"
            >
              {s.skill.name}
            </span>
          ))}
          {(f.skills?.length ?? 0) > 4 && (
            <span className="text-[10px] text-slate-400">
              +{f.skills.length - 4}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          {f.averageRating ? (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-600">
                {f.averageRating.toFixed(1)}
              </span>
              <span>({f.totalReviews})</span>
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {f.completedContracts} jobs
          </span>
        </div>

        {/* Portfolio preview */}
        {f.portfolioItems?.length > 0 && (
          <div className="flex gap-1.5">
            {f.portfolioItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex-1 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] text-slate-400 px-1 text-center line-clamp-2">
                    {item.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-50">
          <div>
            {f.hourlyRate ? (
              <>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  Hourly
                </span>
                <span className="text-base font-bold text-slate-800">
                  ${f.hourlyRate}
                  <span className="text-xs font-normal text-slate-400">
                    /hr
                  </span>
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Rate negotiable</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-xl border-blue-100 text-blue-500 hover:bg-blue-50"
              onClick={handleMessage}
              disabled={isMessaging}
            >
              {isMessaging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-xl border-blue-100 text-blue-500 hover:bg-blue-50"
              onClick={handleInvite}
            >
              <UserPlus className="w-3.5 h-3.5" />
            </Button>
            <Link to={`/client/freelancers/${f.id}`}>
              <Button
                size="icon"
                className="h-8 w-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200 group-hover:translate-x-0.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <InviteFreelancerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        freelancerId={f.id}
        freelancerName={f.fullName}
      />
    </Card>
  );
};
