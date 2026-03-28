import { ReactNode, useState, useEffect } from "react";
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
  Laptop,
  Heart,
  Sun,
  Moon,
  Sparkles,
  Inbox,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import logo from "@/assets/logo/logo.png";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  isTokenItem?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  useEffect(() => {
    if (user?.role === "FREELANCER") {
      const fetchBalance = async () => {
        try {
          const res = await api.get("/tokens/balance");
          setTokenBalance(res.data.balance);
        } catch (err) {
          // silent failure for UI
        }
      };
      fetchBalance();
      // Polling or refresh interval could be added here if needed
    }

    const fetchUnreadChat = async () => {
      try {
        const res = await api.get("/chat/unread-count");
        setUnreadChatCount(res.data.count);
      } catch (err) {}
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications?limit=5");
        setNotifications(res.data.notifications);
        setUnreadNotificationCount(res.data.unreadCount);
      } catch (err) {}
    };

    if (user) {
      fetchUnreadChat();
      fetchNotifications();

      const socket = getSocket();
      
      const handleUnreadChatUpdate = ({ count }: { count: number }) => {
        setUnreadChatCount(count);
      };

      const handleNewNotification = (notification: any) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
        setUnreadNotificationCount(prev => prev + 1);
        
        // Show a nice toast
        toast(notification.title, {
          description: notification.body,
          action: {
            label: "View",
            onClick: () => navigate(notification.link || "/notifications"),
          },
        });
      };

      socket.on("unread_count_update", handleUnreadChatUpdate);
      socket.on("new_notification", handleNewNotification);

      return () => {
        socket.off("unread_count_update", handleUnreadChatUpdate);
        socket.off("new_notification", handleNewNotification);
      };
    }
  }, [user]);

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
              {
                icon: FileText,
                label: "Drafts",
                href: "/client/drafts",
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
              { icon: Inbox, label: "Direct Invites", href: "/client/invites" },
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
                badge: unreadChatCount > 0 ? unreadChatCount : undefined,
              },
              { icon: Briefcase, label: "My Contracts", href: "/client/contracts" },
              { icon: Star, label: "Reviews", href: "/client/reviews" },
            ],
          },
          {
            label: "Account",
            items: [
              { icon: User, label: "Profile", href: "/client/profile" },
              { icon: Settings, label: "Settings", href: "/settings" },
            ],
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
              {
                icon: Zap,
                label: "SkillTokens",
                href: "/freelancer/tokens",
                isTokenItem: true,
              },
              {
                icon: Heart,
                label: "Saved Projects",
                href: "/freelancer/saved",
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
                icon: Inbox,
                label: "Invitations",
                href: "/freelancer/invitations",
              },
              {
                icon: Briefcase,
                label: "My Contracts",
                href: "/freelancer/contracts",
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
                badge: unreadChatCount > 0 ? unreadChatCount : undefined,
              },
              {
                icon: Star,
                label: "Reviews",
                href: "/freelancer/reviews",
              },
            ],
          },
          {
            label: "Account",
            items: [
              { icon: User, label: "Profile", href: "/freelancer/profile" },
              {
                icon: Settings,
                label: "Settings",
                href: "/freelancer/settings",
              },
            ],
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
              { icon: Star, label: "Skills", href: "/admin/skills" },
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
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card/70 backdrop-blur-md border-r transition-all duration-300 ease-in-out flex flex-col",
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
        <nav
          className={cn(
            "flex-1 space-y-6 overflow-y-auto scrollbar-none",
            sidebarCollapsed ? "py-4 px-2" : "p-4",
          )}
        >
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
                          "group flex items-center rounded-lg transition-all duration-200 outline-none",
                          sidebarCollapsed
                            ? "justify-center w-10 h-10 mx-auto"
                            : "gap-3 px-3 py-2 border-l-[3px]",
                          isActive
                            ? sidebarCollapsed
                              ? "bg-primary/8 text-primary font-semibold"
                              : "bg-primary/8 text-primary font-semibold border-primary"
                            : sidebarCollapsed
                              ? "text-muted-foreground/80 hover:bg-primary/5 hover:text-foreground"
                              : "text-muted-foreground/80 hover:bg-primary/5 hover:text-foreground border-transparent",
                        )}
                      >
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
                            {item.isTokenItem && tokenBalance !== null && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none h-5 px-1.5 font-black text-[10px] shadow-lg shadow-amber-500/20">
                                {tokenBalance}
                              </Badge>
                            )}
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
            "border-t bg-card/50 backdrop-blur-md transition-all duration-300 flex flex-col items-center",
            sidebarCollapsed ? "p-2 space-y-2" : "p-4 space-y-4",
          )}
        >
          {/* Account Group */}
          <div className="w-full">
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
                          "group flex items-center rounded-lg transition-all duration-200 outline-none w-full border-l-[3px]",
                          sidebarCollapsed
                            ? "justify-center h-10 w-10 mx-auto border-transparent"
                            : "gap-3 px-3 py-2",
                          isActive
                            ? "bg-primary/8 text-primary font-semibold border-primary"
                            : "text-muted-foreground/80 hover:bg-primary/5 hover:text-foreground border-transparent",
                        )}
                      >
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

          {/* User Profile */}
          <div
            className={cn(
              "flex items-center transition-all duration-300 w-full",
              sidebarCollapsed ? "justify-center h-10 w-10" : "gap-3 px-1",
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

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center font-semibold text-muted-foreground hover:text-destructive transition-all duration-200 rounded-lg hover:bg-destructive/8 group w-full",
              sidebarCollapsed
                ? "justify-center h-10 w-10 mx-auto"
                : "gap-3 text-[13px] px-3 py-2",
            )}
          >
            <LogOut
              className={cn(
                "transition-transform",
                sidebarCollapsed
                  ? "w-4 h-4"
                  : "w-4 h-4 group-hover:-translate-x-0.5",
              )}
            />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
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
                  {unreadNotificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                    >
                      {unreadNotificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="font-bold text-sm text-foreground/80">Notifications</span>
                  {unreadNotificationCount > 0 && (
                     <button 
                        className="text-[10px] text-primary hover:underline font-bold"
                        onClick={async () => {
                          try {
                            await api.patch('/notifications/read-all');
                            setUnreadNotificationCount(0);
                            setNotifications(prev => prev.map(n => ({...n, isRead: true})));
                          } catch(err){}
                        }}
                     >
                        Mark all as read
                     </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={cn(
                          "flex flex-col items-start gap-1 py-3 cursor-pointer border-b last:border-0",
                          !n.isRead && "bg-primary/5 shadow-inner border-l-2 border-l-primary"
                        )}
                        onClick={() => {
                          if (!n.isRead) {
                            api.patch(`/notifications/${n.id}/read`);
                            setUnreadNotificationCount(prev => Math.max(0, prev - 1));
                            setNotifications(prev => prev.map(item => item.id === n.id ? {...item, isRead: true} : item));
                          }
                          if (n.link) navigate(n.link);
                        }}
                      >
                        <div className="flex w-full justify-between items-start gap-2">
                          <span className={cn("font-bold text-[13px] leading-tight", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {n.body}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>System</span>
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
                  <Link
                    to={
                      user?.role === "FREELANCER"
                        ? "/freelancer/settings"
                        : "/settings"
                    }
                  >
                    Settings
                  </Link>
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
        <main className="p-6 flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
