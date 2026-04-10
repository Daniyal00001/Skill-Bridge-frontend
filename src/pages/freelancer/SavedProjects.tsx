import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowLeft,
  Bookmark,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { ProjectCardGrid } from "@/components/browse/ProjectCardGrid";
import { ProjectCardList } from "@/components/browse/ProjectCardList";
import { SkeletonGrid, SkeletonList } from "@/components/browse/SkeletonCard";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function SavedProjects() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/browse-projects/projects/saved");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch saved projects:", err);
      toast.error("Failed to load saved projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const handleUnsave = async (projectId: string) => {
    // Optimistic remove
    const previousProjects = [...projects];
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    try {
      await api.post(`/browse-projects/projects/${projectId}/save`);
      toast.success("Project removed from saved");
    } catch (err) {
      setProjects(previousProjects);
      toast.error("Failed to remove project");
    }
  };

  return (
    <DashboardLayout>
      {/* Background decoration */}
      <div
        className="pointer-events-none fixed top-0 right-0 z-0"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          transform: "translate(30%, -30%)",
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Personal Bookmarks</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Saved Projects
            </h1>
            <p className="text-sm text-slate-400">
              {loading ? "Loading your bookmarks..." : `${projects?.length || 0} projects you've bookmarked for later`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/freelancer/browse">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 gap-2 hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" />
                Back to Browse
              </Button>
            </Link>

            <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  view === "grid" ? "bg-white shadow-sm text-blue-500" : "text-slate-400 hover:text-slate-600"
                )}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg transition-all",
                  view === "list" ? "bg-white shadow-sm text-blue-500" : "text-slate-400 hover:text-slate-600"
                )}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          view === "grid" ? <SkeletonGrid count={6} /> : <SkeletonList count={4} />
        ) : (projects?.length || 0) > 0 ? (
          <div className={cn(
            "grid gap-6",
            view === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            <AnimatePresence mode="popLayout">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  {view === "grid" ? (
                    <ProjectCardGrid 
                      project={project} 
                      isSaved={true} 
                      onSave={() => handleUnsave(project.id)} 
                      onView={async () => {}}
                    />
                  ) : (
                    <ProjectCardList 
                      project={project} 
                      isSaved={true} 
                      onSave={() => handleUnsave(project.id)} 
                      onView={async () => {}}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-300">
              <Bookmark className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No saved projects yet</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
              Bookmark projects you're interested in while browsing to keep track of them here.
            </p>
            <Link to="/freelancer/browse" className="mt-8">
              <Button className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white px-8 gap-2">
                <Sparkles className="w-4 h-4" />
                Start Browsing
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
