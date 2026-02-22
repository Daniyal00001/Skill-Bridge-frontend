import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileKey, History } from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 1, action: 'User Suspended', admin: 'SuperAdmin', target: 'johndoe@test.com', time: '2 mins ago', severity: 'high' },
  { id: 2, action: 'Project Deleted', admin: 'Moderator_1', target: 'Proj #124', time: '45 mins ago', severity: 'medium' },
  { id: 3, action: 'Dispute Resolved', admin: 'Admin_Sarah', target: 'Disp #05', time: '2 hours ago', severity: 'low' },
  { id: 4, action: 'Bulk Email Sent', admin: 'SuperAdmin', target: 'All Users', time: '5 hours ago', severity: 'medium' },
];

export default function Security() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Security</h1>
          <p className="text-muted-foreground mt-1">
            Audit logs and security configurations for the SkillBridge platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">MFA status</CardTitle>
                <Badge variant="success">ENABLED</Badge>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Firewall</CardTitle>
                <Badge variant="success">PROTECTING</Badge>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileKey className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">API Keys</CardTitle>
                <Badge variant="outline">2 ACTIVE</Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> Administrative Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Action</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right pr-6">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_AUDIT_LOGS.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 font-medium">{log.action}</TableCell>
                    <TableCell>{log.admin}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{log.time}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant={
                        log.severity === 'high' ? 'destructive' : 
                        log.severity === 'medium' ? 'warning' : 'secondary'
                      }>
                        {log.severity.toUpperCase()}
                      </Badge>
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
