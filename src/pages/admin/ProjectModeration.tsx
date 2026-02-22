import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertOctagon, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { mockProjects } from '@/lib/mockData';
import { toast } from 'sonner';

export default function ProjectModeration() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = mockProjects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (id: string) => {
    toast.success('Project approved and listed publicly');
  };

  const handleFlag = (id: string) => {
    toast.warning('Project flagged for further review');
  };

  const statusColors: Record<string, string> = {
    open: 'bg-green-500/10 text-green-600',
    in_progress: 'bg-blue-500/10 text-blue-600',
    completed: 'bg-gray-500/10 text-gray-600',
    draft: 'bg-yellow-500/10 text-yellow-600',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, and manage projects posted on the platform.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Project Title</TableHead>
                  <TableHead>Budget Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex flex-col max-w-[300px]">
                        <span className="truncate">{project.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{project.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[project.status]}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(`/admin/projects/${project.id}`, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleApprove(project.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFlag(project.id)}>
                            <AlertOctagon className="w-4 h-4 mr-2 text-warning" /> Flag Content
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
