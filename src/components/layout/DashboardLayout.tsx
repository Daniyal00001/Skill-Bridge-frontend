import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  FolderOpen,
  MessageSquare,
  Settings,
  Users,
  FileText,
  Star,
  Briefcase,
  Search,
  PlusCircle,
  BarChart3,
  Shield,
  AlertTriangle,
  Zap,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { mockNotifications } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo/logo.png';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'CLIENT':
        return [
          { icon: Home, label: 'Dashboard', href: '/client' },
          { icon: PlusCircle, label: 'Post a New Project', href: '/client/post-project' },
          { icon: FolderOpen, label: 'My Projects', href: '/client/projects' },
          { icon: Sparkles, label: 'Help Me Find', href: '/client/help-me-find' },
          { icon: MessageSquare, label: 'Messages', href: '/client/messages', badge: 2 },
          { icon: Star, label: 'Reviews', href: '/client/reviews' },
          { icon: Settings, label: 'Settings', href: '/settings' },
        ];
      case 'FREELANCER':
        return [
          { icon: Home, label: 'Dashboard', href: '/freelancer' },
          { icon: Search, label: 'Browse Projects', href: '/freelancer/browse' },
          { icon: FileText, label: 'My Proposals', href: '/freelancer/proposals' },
          { icon: Briefcase, label: 'Active Projects', href: '/freelancer/projects' },
          { icon: MessageSquare, label: 'Messages', href: '/freelancer/messages', badge: 3 },
          { icon: User, label: 'Profile', href: '/freelancer/profile' },
          { icon: Settings, label: 'Settings', href: '/settings' },
        ];
      case 'ADMIN':
        return [
          { icon: Home, label: 'Dashboard', href: '/admin' },
          { icon: Users, label: 'Users', href: '/admin/users' },
          { icon: FolderOpen, label: 'Projects', href: '/admin/projects' },
          { icon: AlertTriangle, label: 'Disputes', href: '/admin/disputes', badge: 3 },
          { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
          { icon: Shield, label: 'Security', href: '/admin/security' },
          { icon: Settings, label: 'Settings', href: '/settings' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center">
            <div className=" h-11 flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="SkillBridge" className="w-full h-full object-contain" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold gradient-text">SkillBridge</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border rounded-full flex items-center justify-center shadow-md hover:bg-accent transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full p-2 rounded-lg hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {navItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.slice(0, 3).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.description}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="w-full text-center text-primary">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
