import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  DollarSign, 
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  adminDashboardStats, 
  mockUsers,
  mockProjects
} from '@/lib/mockData';

export default function AdminDashboard() {
  const recentUsers = mockUsers.slice(0, 5);
  const recentProjects = mockProjects.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={adminDashboardStats.totalUsers.toLocaleString()}
            change={`+${adminDashboardStats.newUsersThisMonth} this month`}
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Active Projects"
            value={adminDashboardStats.activeProjects}
            change={`+${adminDashboardStats.projectsThisMonth} this month`}
            changeType="positive"
            icon={FolderOpen}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(adminDashboardStats.totalRevenue / 1000).toFixed(0)}K`}
            change="+18.2% from last month"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Open Disputes"
            value={adminDashboardStats.disputesOpen}
            change="Requires attention"
            changeType="negative"
            icon={AlertTriangle}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Revenue Overview</span>
                <Button variant="ghost" size="sm">View Report</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Revenue Chart</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect backend to see real data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Project Success Rate</p>
                  <p className="text-2xl font-bold">96.5%</p>
                </div>
                <div className="flex items-center text-success">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+2.3%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Project Value</p>
                  <p className="text-2xl font-bold">$4,250</p>
                </div>
                <div className="flex items-center text-success">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+8.1%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">User Retention</p>
                  <p className="text-2xl font-bold">89.2%</p>
                </div>
                <div className="flex items-center text-destructive">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">-1.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  <p className="text-2xl font-bold">2.4h</p>
                </div>
                <div className="flex items-center text-success">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">-0.8h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Users</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Projects</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <p className="font-medium truncate max-w-[200px]">
                          {project.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            project.status === 'open' ? 'success' : 
                            project.status === 'in_progress' ? 'default' : 
                            'secondary'
                          }
                          className="capitalize"
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
