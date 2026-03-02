import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { mockNotifications } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const getNavGroups = (): NavGroup[] => {
    switch (user?.role) {
      case "CLIENT":
        return [
          {
            label: "Main",
            items: [
              { icon: Home, label: "Dashboard", href: "/client" },
              {
                icon: PlusCircle,
                label: "Post Project",
                href: "/client/post-project",
              },
              {
                icon: FolderOpen,
                label: "My Projects",
                href: "/client/projects",
              },
            ],
          },
          {
            label: "Talent",
            items: [
              {
                icon: Search,
                label: "Browse Freelancers",
                href: "/client/browse",
              },
              {
                icon: Sparkles,
                label: "AI Assistant",
                href: "/client/ai-assistant",
              },
            ],
          },
          {
            label: "Manage",
            items: [
              { icon: FileText, label: "Proposals", href: "/client/proposals" },
              {
                icon: MessageSquare,
                label: "Messages",
                href: "/client/messages",
                badge: 2,
              },
              { icon: Star, label: "Reviews", href: "/client/reviews" },
            ],
          },
          {
            label: "Account",
            items: [{ icon: Settings, label: "Settings", href: "/settings" }],
          },
        ];
      case "FREELANCER":
        return [
          {
            label: "Main",
            items: [
              { icon: Home, label: "Dashboard", href: "/freelancer" },
              {
                icon: Search,
                label: "Browse Projects",
                href: "/freelancer/browse",
              },
            ],
          },
          {
            label: "Work",
            items: [
              {
                icon: FileText,
                label: "My Proposals",
                href: "/freelancer/proposals",
              },
              {
                icon: Briefcase,
                label: "Active Projects",
                href: "/freelancer/projects",
              },
            ],
          },
          {
            label: "Communication",
            items: [
              {
                icon: MessageSquare,
                label: "Messages",
                href: "/freelancer/messages",
                badge: 3,
              },
            ],
          },
          {
            label: "Account",
            items: [{ icon: Settings, label: "Settings", href: "/settings" }],
          },
        ];
      case "ADMIN":
        return [
          {
            label: "Overview",
            items: [
              { icon: Home, label: "Dashboard", href: "/admin" },
              { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
            ],
          },
          {
            label: "Users & Content",
            items: [
              { icon: Users, label: "Users", href: "/admin/users" },
              { icon: FolderOpen, label: "Projects", href: "/admin/projects" },
              {
                icon: AlertTriangle,
                label: "Disputes",
                href: "/admin/disputes",
                badge: 3,
              },
            ],
          },
          {
            label: "System",
            items: [
              { icon: Shield, label: "Security", href: "/admin/security" },
              { icon: Settings, label: "Settings", href: "/settings" },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const navGroups = getNavGroups();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card/70 backdrop-blur-md border-r transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center">
            <div className=" h-11 flex items-center justify-center flex-shrink-0">
              <img
                src={logo}
                alt="SkillBridge"
                className="w-full h-full object-contain"
              />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold gradient-text">
                SkillBridge
              </span>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
          {navGroups
            .filter((g) => g.label !== "Account" && g.label !== "System")
            .map((group, idx) => (
              <div key={idx} className="space-y-1">
                {!sidebarCollapsed && group.label && (
                  <h3 className="px-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mb-2">
                    {group.label}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 outline-none",
                          isActive
                            ? "bg-primary/8 text-primary font-semibold"
                            : "text-muted-foreground/80 hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-[3px] h-5 bg-primary rounded-r-full" />
                        )}

                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/60 group-hover:text-foreground",
                          )}
                        />

                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-[13px] tracking-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge
                                variant="destructive"
                                className="h-4.5 min-w-[18px] px-1 text-[10px] flex items-center justify-center border-none shadow-sm"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
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

        {/* Persistent Bottom Section (Account & Profile) */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 border-t bg-card/50 backdrop-blur-md transition-all duration-300",
            sidebarCollapsed ? "p-2" : "p-4",
          )}
        >
          {/* Account Group */}
          <div className={cn(sidebarCollapsed ? "mb-2" : "mb-0")}>
            {navGroups
              .filter((g) => g.label === "Account" || g.label === "System")
              .map((group, idx) => (
                <div key={idx} className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "group relative flex items-center rounded-lg transition-all duration-200 outline-none",
                          sidebarCollapsed
                            ? "justify-center p-2"
                            : "gap-3 px-3 py-2",
                          isActive
                            ? "bg-primary/8 text-primary font-semibold"
                            : "text-muted-foreground/80 hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-[3px] h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground/60 group-hover:text-foreground",
                          )}
                        />
                        {!sidebarCollapsed && (
                          <span className="flex-1 text-[13px] tracking-tight">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* User Profile & Logout */}
          <div className={cn("space-y-4", sidebarCollapsed ? "pt-2" : "pt-0")}>
            <div
              className={cn(
                "flex items-center gap-3",
                sidebarCollapsed ? "justify-center" : "px-1",
              )}
            >
              <Avatar
                className={cn(
                  "border-2 border-primary/10 shadow-sm transition-all",
                  sidebarCollapsed ? "h-8 w-8" : "h-9 w-9",
                )}
              >
                <AvatarImage src={user?.profileImage} alt={user?.name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-none mb-1">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-bold">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center font-medium text-muted-foreground hover:text-destructive transition-all duration-200 rounded-lg hover:bg-destructive/8 group",
                sidebarCollapsed
                  ? "justify-center p-2"
                  : "gap-2 text-[12px] w-full px-3 py-2",
              )}
            >
              <LogOut
                className={cn(
                  "transition-transform",
                  sidebarCollapsed
                    ? "w-4 h-4"
                    : "w-3.5 h-3.5 group-hover:-translate-x-0.5",
                )}
              />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-60",
        )}
      >
        {/* Top Bar */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-tight text-foreground/80">
              {navGroups
                .flatMap((g) => g.items)
                .find((item) => item.href === location.pathname)?.label ||
                "Dashboard"}
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
                  <Link
                    to="/notifications"
                    className="w-full text-center text-primary"
                  >
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
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
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
