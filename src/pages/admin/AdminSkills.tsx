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
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSkills();
  }, []);

  const fetchPendingSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/skills?status=PENDING');
      setSkills(res.data.skills || []);
    } catch (error) {
      toast.error('Failed to load pending skills.');
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Skills Approval</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve custom skills entered by users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Custom Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No pending skills requiring approval right now.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Name</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>{new Date(skill.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-none">
                          {skill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-success border-success/30 hover:bg-success/10"
                          onClick={() => handleUpdateStatus(skill.id, 'APPROVED')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleUpdateStatus(skill.id, 'REJECTED')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
