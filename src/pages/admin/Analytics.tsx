import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  FolderOpen, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Globe,
  PieChart
} from 'lucide-react';

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into project growth, revenue trends, and user behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Revenue growth"
            value="+24.5%"
            change="vs last month"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Sessions"
            value="1,280"
            change="Real-time"
            changeType="positive"
            icon={Activity}
          />
          <StatsCard
            title="Global Reach"
            value="42"
            change="Countries active"
            changeType="positive"
            icon={Globe}
          />
          <StatsCard
            title="Conversion Rate"
            value="3.8%"
            change="+0.4% improvement"
            changeType="positive"
            icon={PieChart}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Volume (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border border-dashed rounded-lg bg-muted/20">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground/50">Chart visualization requires D3 or Chart.js</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'Web Dev', percentage: 45, color: 'bg-primary' },
                { name: 'Design', percentage: 25, color: 'bg-orange-500' },
                { name: 'Content', percentage: 15, color: 'bg-green-500' },
                { name: 'Mobile', percentage: 15, color: 'bg-blue-500' },
              ].map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{cat.name}</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} transition-all duration-1000`} 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { BarChart3 } from 'lucide-react';
