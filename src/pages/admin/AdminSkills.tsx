import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Loader2, Sparkles, Ban, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Skill {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    fetchSkills();
  }, [activeTab]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/skills?status=${activeTab}`);
      setSkills(res.data.skills || []);
    } catch (error) {
      toast.error(`Failed to load ${activeTab.toLowerCase()} skills.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/skills/${id}/status`, { status });
      toast.success(`Skill ${status.toLowerCase()} successfully`);
      setSkills(skills.filter(s => s.id !== id));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Content Moderation</p>
          <h1 className="text-4xl font-black tracking-tighter">Skills Approval</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Review and manage custom skill proposals from the community.
          </p>
        </div>

        <Tabs defaultValue="PENDING" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border/50 h-14">
            <TabsTrigger value="PENDING" className="rounded-xl px-8 h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
              <Clock className="w-3.5 h-3.5" /> Pending
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="rounded-xl px-8 h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 transition-all">
              <Sparkles className="w-3.5 h-3.5" /> Approved
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="rounded-xl px-8 h-full font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-rose-600 transition-all">
              <Ban className="w-3.5 h-3.5" /> Rejected
            </TabsTrigger>
          </TabsList>

          <Card className="rounded-[2rem] border-border/50 shadow-xl overflow-hidden group/card bg-card/40 backdrop-blur-sm">
            <CardHeader className="bg-muted/20 border-b border-border/40 px-8 py-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", 
                  activeTab === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                  activeTab === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                )} />
                {activeTab} Custom Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Decrypting Records...</p>
                </div>
              ) : skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
                  <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                    {activeTab === 'PENDING' ? <Clock className="w-8 h-8" /> : 
                     activeTab === 'APPROVED' ? <Sparkles className="w-8 h-8" /> : <Ban className="w-8 h-8" />}
                  </div>
                  <p className="text-sm font-bold tracking-tight text-center max-w-[200px]">
                    No {activeTab.toLowerCase()} skills captured in this protocol.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent bg-muted/5">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest h-14">Skill Name</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Date Created</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14">Status</TableHead>
                        <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest h-14">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skills.map((skill) => (
                        <TableRow key={skill.id} className="border-border/30 hover:bg-muted/30 group/row transition-colors">
                          <TableCell className="pl-8 py-5 font-bold text-sm tracking-tight">{skill.name}</TableCell>
                          <TableCell className="text-xs font-semibold text-muted-foreground">{new Date(skill.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={cn("px-3 py-1 rounded-lg font-black text-[10px] tracking-tight border shadow-none",
                              activeTab === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                              activeTab === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                              'bg-rose-500/10 text-rose-600 border-rose-200'
                            )}>
                              {skill.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            {activeTab === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-xl font-bold bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                                  onClick={() => handleUpdateStatus(skill.id, 'APPROVED')}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-xl font-bold bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all shadow-sm"
                                  onClick={() => handleUpdateStatus(skill.id, 'REJECTED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                               <Badge variant="outline" className="opacity-40 italic font-medium rounded-lg">Read-Only Protocol</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
