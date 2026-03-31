import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  UserPlus,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { InviteFreelancerModal } from "@/components/modals/InviteFreelancerModal";

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await api.get(`/freelancers/gigs/${id}`);
        setGig(res.data.data);
      } catch (err) {
        console.error("Failed to fetch gig", err);
        toast.error("Gig not found");
        navigate("/client/browse");
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id, navigate]);

  const handleMessage = async () => {
    if (!gig || isMessaging) return;
    setIsMessaging(true);
    try {
      const res = await api.post(`/freelancers/${gig.freelancerProfileId}/message`);
      const chatRoomId = res.data.data.id;
      toast.success("Chat initiated successfully");
      window.location.href = `/client/messages?room=${chatRoomId}`;
    } catch {
      toast.error("Could not start chat");
      setIsMessaging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
            Fetching Service Details…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!gig) return null;

  const freelancer = gig.freelancerProfile;
  const initials = freelancer.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4" style={{ fontFamily: "'Sora', sans-serif" }}>
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Link 
            to={`/client/freelancers/${freelancer.id}`}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
            Service Detail
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visuals & Main Description (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Image Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-xl border border-slate-100 aspect-[16/10]">
              {gig.fileUrl ? (
                <img 
                  src={gig.fileUrl} 
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <Zap className="w-24 h-24 text-slate-400" />
                </div>
              )}
              
              {/* Floating Badge */}
              <div className="absolute top-8 left-8">
                <div className="bg-white/80 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    Premium Service
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                About This Service
                <div className="h-px flex-1 bg-slate-100" />
              </h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {gig.description || "The freelancer has not provided a detailed description for this service package yet, but you can inquire directly to learn more about the scope and deliverables."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Seller (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Action Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 sticky top-8">
              <h1 className="text-2xl font-black leading-[1.1] mb-6 uppercase tracking-tighter">
                {gig.title}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Safe Payment</p>
                    <p className="text-[10px] font-medium text-white/40 leading-none mt-0.5">Funds held in escrow</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Hire Now
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-14 bg-transparent border-white/20 hover:bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  onClick={handleMessage}
                  disabled={isMessaging}
                >
                  {isMessaging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  Contact Seller
                </Button>
              </div>

              <p className="mt-6 text-[10px] text-center text-white/30 font-bold uppercase tracking-[0.2em]">
                100% Satisfaction Guarantee
              </p>
            </div>

            {/* Seller Quick Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Service Provider</h4>
              
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-14 w-14 ring-4 ring-slate-50 border border-slate-100 shadow-sm">
                  <AvatarImage src={freelancer.user?.profileImage} />
                  <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1 text-lg">
                    {freelancer.fullName}
                  </h5>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                asChild
                className="w-full justify-between h-12 rounded-xl hover:bg-slate-50 group px-4"
              >
                <Link to={`/client/freelancers/${freelancer.id}`}>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">
                    View Full Profile
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <InviteFreelancerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        freelancerId={freelancer.id}
        freelancerName={freelancer.fullName}
      />
    </DashboardLayout>
  );
};

export default GigDetail;
