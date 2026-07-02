import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  ScanLine,
  PiggyBank,
  CalendarClock,
  Target,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "nav-dashboard" },
  { to: "/app/transactions", label: "Transactions", icon: Receipt, testId: "nav-transactions" },
  { to: "/app/receipt", label: "Scan Receipt", icon: ScanLine, testId: "nav-receipt" },
  { to: "/app/budgets", label: "Budgets", icon: PiggyBank, testId: "nav-budgets" },
  { to: "/app/bills", label: "Recurring Bills", icon: CalendarClock, testId: "nav-bills" },
  { to: "/app/goals", label: "Savings Goals", icon: Target, testId: "nav-goals" },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon, testId: "nav-settings" },
];

function NavItem({ to, label, icon: Icon, end, testId, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      data-testid={testId}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-foreground/75 hover:text-foreground hover:bg-white/[0.03]"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNav }) {
  return (
    <div className="flex flex-col h-full">
      <Link to="/app" className="flex items-center gap-2 px-4 py-5" onClick={onNav} data-testid="sidebar-logo">
        <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="font-display text-lg font-semibold tracking-tight">FinSight</div>
      </Link>
      <nav className="px-3 flex flex-col gap-1 flex-1">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNav} />
        ))}
      </nav>
      <div className="px-4 py-4 text-xs text-muted-foreground border-t border-border">
        <div>AI-powered by Gemini 2.5</div>
      </div>
    </div>
  );
}

export function AppShell({ children, title, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const doLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-[260px] border-r border-border bg-card/40">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 h-14 px-4 sm:px-6 lg:px-8 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="open-mobile-nav">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 bg-card border-border">
                <SidebarContent onNav={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-semibold truncate" data-testid="page-title">{title}</h1>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="user-menu-button" className="gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                  {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm">{user?.name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/app/settings")} data-testid="menu-settings">
                <SettingsIcon className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={doLogout} data-testid="menu-logout">
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
