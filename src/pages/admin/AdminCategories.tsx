import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
  Tag,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  createdAt: string;
  subCategories: SubCategory[];
  _count: { projects: number; subCategories: number };
}

// Icon picker options
const ICON_OPTIONS = [
  "Code", "Palette", "PenTool", "Globe", "Camera", "Music", "BookOpen",
  "Briefcase", "BarChart3", "Wrench", "Heart", "Cpu", "Film", "MessageSquare",
  "ShoppingBag", "Home", "Layers", "Zap", "Star", "Database",
];

const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get("/admin/categories");
  return res.data.categories;
};

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Dialogs
  const [catDialog, setCatDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    category?: Category;
  }>({ open: false, mode: "create" });
  const [subDialog, setSubDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    categoryId?: string;
    sub?: SubCategory;
  }>({ open: false, mode: "create" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "category" | "subcategory";
    id: string;
    name: string;
  } | null>(null);

  // Form state
  const [catForm, setCatForm] = useState({ 
    name: "", 
    slug: "", 
    icon: "",
    subCategoryName: "",
    subCategorySlug: ""
  });
  const [subForm, setSubForm] = useState({ name: "", slug: "" });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchCategories,
  });

  // Mutations
  const createCat = useMutation({
    mutationFn: (data: typeof catForm) => api.post("/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category created");
      setCatDialog({ open: false, mode: "create" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateCat = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof catForm> }) =>
      api.patch(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category updated");
      setCatDialog({ open: false, mode: "create" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteCat = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category deleted");
      setDeleteDialog(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const createSub = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: typeof subForm }) =>
      api.post(`/admin/categories/${categoryId}/subcategories`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Subcategory created");
      setSubDialog({ open: false, mode: "create" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateSub = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof subForm> }) =>
      api.patch(`/admin/subcategories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Subcategory updated");
      setSubDialog({ open: false, mode: "create" });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const deleteSub = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/subcategories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Subcategory deleted");
      setDeleteDialog(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreateCat = () => {
    setCatForm({ name: "", slug: "", icon: "", subCategoryName: "", subCategorySlug: "" });
    setCatDialog({ open: true, mode: "create" });
  };

  const openEditCat = (cat: Category) => {
    setCatForm({ name: cat.name, slug: cat.slug, icon: cat.icon || "" });
    setCatDialog({ open: true, mode: "edit", category: cat });
  };

  const openCreateSub = (categoryId: string) => {
    setSubForm({ name: "", slug: "" });
    setSubDialog({ open: true, mode: "create", categoryId });
  };

  const openEditSub = (sub: SubCategory) => {
    setSubForm({ name: sub.name, slug: sub.slug });
    setSubDialog({ open: true, mode: "edit", sub });
  };

  const handleCatSubmit = () => {
    if (catDialog.mode === "create") {
      createCat.mutate(catForm);
    } else {
      updateCat.mutate({ id: catDialog.category!.id, data: catForm });
    }
  };

  const handleSubSubmit = () => {
    if (subDialog.mode === "create") {
      createSub.mutate({ categoryId: subDialog.categoryId!, data: subForm });
    } else {
      updateSub.mutate({ id: subDialog.sub!.id, data: subForm });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteDialog) return;
    if (deleteDialog.type === "category") {
      deleteCat.mutate(deleteDialog.id);
    } else {
      deleteSub.mutate(deleteDialog.id);
    }
  };

  // Auto-generate slug from name
  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Content Management
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Categories &amp; Subcategories
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage project categories and their subcategories used across the platform.
            </p>
          </div>
          <Button onClick={openCreateCat} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Categories",
              value: categories.length,
              icon: FolderOpen,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              label: "Total Subcategories",
              value: categories.reduce((acc, c) => acc + c.subCategories.length, 0),
              icon: Tag,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Projects Categorized",
              value: categories.reduce((acc, c) => acc + c._count.projects, 0),
              icon: Layers,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border border-border/50 rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border border-dashed border-border rounded-2xl">
            <CardContent className="py-16 flex flex-col items-center gap-3">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                {search ? "No categories match your search." : "No categories yet. Create your first category!"}
              </p>
              {!search && (
                <Button variant="outline" onClick={openCreateCat} className="gap-2 mt-2">
                  <Plus className="w-4 h-4" /> Add Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((cat) => (
              <Card key={cat.id} className="border border-border/50 rounded-2xl overflow-hidden">
                {/* Category Row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(cat.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-muted-foreground shrink-0">
                      {expanded.has(cat.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {cat.icon && (
                      <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{cat.icon.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">/{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {cat._count.subCategories} subs
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-semibold text-emerald-700 border-emerald-200 bg-emerald-50">
                        {cat._count.projects} projects
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/8"
                      onClick={() => openCreateSub(cat.id)}
                      title="Add subcategory"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/8"
                      onClick={() => openEditCat(cat)}
                      title="Edit category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50 text-red-500"
                      onClick={() =>
                        setDeleteDialog({ open: true, type: "category", id: cat.id, name: cat.name })
                      }
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {expanded.has(cat.id) && (
                  <div className="border-t border-border/30 bg-muted/20">
                    {cat.subCategories.length === 0 ? (
                      <div className="px-12 py-4 text-sm text-muted-foreground italic flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        No subcategories yet.{" "}
                        <button
                          className="text-primary hover:underline font-semibold text-xs"
                          onClick={() => openCreateSub(cat.id)}
                        >
                          Add one
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/20">
                        {cat.subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between px-12 py-2.5 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                              <p className="text-sm font-medium text-foreground">{sub.name}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">/{sub.slug}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/8"
                                onClick={() => openEditSub(sub)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-red-50 text-red-500"
                                onClick={() =>
                                  setDeleteDialog({ open: true, type: "subcategory", id: sub.id, name: sub.name })
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="px-12 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-7 text-xs text-primary hover:bg-primary/8"
                            onClick={() => openCreateSub(cat.id)}
                          >
                            <Plus className="h-3 w-3" /> Add subcategory
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={catDialog.open} onOpenChange={(o) => setCatDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {catDialog.mode === "create" ? "Add New Category" : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-1 py-2 space-y-4 scroll-smooth">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Web Development"
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm((p) => ({ ...p, name, slug: catDialog.mode === "create" ? slugify(name) : p.slug }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                placeholder="e.g. web-development"
                value={catForm.slug}
                onChange={(e) => setCatForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">Icon Name (optional)</Label>
              <Input
                id="cat-icon"
                placeholder="e.g. Code, Palette, Globe..."
                value={catForm.icon}
                onChange={(e) => setCatForm((p) => ({ ...p, icon: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCatForm((p) => ({ ...p, icon }))}
                    className={cn(
                      "px-2 py-1 text-[11px] rounded-md border font-medium transition-colors",
                      catForm.icon === icon
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary hover:text-foreground"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {catDialog.mode === "create" && (
              <div className="pt-4 border-t border-border mt-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Initial Subcategory
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-name">Subcategory Name *</Label>
                    <Input
                      id="sub-name"
                      placeholder="e.g. Frontend Development"
                      value={catForm.subCategoryName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCatForm((p) => ({ 
                          ...p, 
                          subCategoryName: val, 
                          subCategorySlug: slugify(val) 
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sub-slug">Subcategory Slug *</Label>
                    <Input
                      id="sub-slug"
                      placeholder="e.g. frontend-development"
                      value={catForm.subCategorySlug}
                      onChange={(e) => setCatForm((p) => ({ ...p, subCategorySlug: slugify(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog({ open: false, mode: "create" })}>
              Cancel
            </Button>
            <Button
              onClick={handleCatSubmit}
              disabled={
                !catForm.name || 
                !catForm.slug || 
                (catDialog.mode === 'create' && (!catForm.subCategoryName || !catForm.subCategorySlug)) ||
                createCat.isPending || 
                updateCat.isPending
              }
            >
              {(createCat.isPending || updateCat.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {catDialog.mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subDialog.open} onOpenChange={(o) => setSubDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subDialog.mode === "create" ? "Add Subcategory" : "Edit Subcategory"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Frontend Development"
                value={subForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setSubForm((p) => ({ ...p, name, slug: subDialog.mode === "create" ? slugify(name) : p.slug }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                placeholder="e.g. frontend-development"
                value={subForm.slug}
                onChange={(e) => setSubForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialog({ open: false, mode: "create" })}>
              Cancel
            </Button>
            <Button
              onClick={handleSubSubmit}
              disabled={!subForm.name || !subForm.slug || createSub.isPending || updateSub.isPending}
            >
              {(createSub.isPending || updateSub.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {subDialog.mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteDialog?.name}</span>?
            {deleteDialog?.type === "category" && (
              <span className="block mt-1 text-red-600 font-medium">
                This will also delete all subcategories in this category!
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteCat.isPending || deleteSub.isPending}
            >
              {(deleteCat.isPending || deleteSub.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

