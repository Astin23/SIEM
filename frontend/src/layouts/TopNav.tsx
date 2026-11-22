import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User, Bell, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentAlerts } from "@/hooks/useDashboardData";
import { SeverityBadge } from "@/components/ui-custom/SeverityBadge";
import { Link } from "react-router-dom";

export function TopNav() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data: alertData } = useRecentAlerts(5);

  const alerts = alertData?.alerts || [];
  const alertCount = alertData?.total || alerts.length || 0;

  return (
    <div className="flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-muted rounded-full border border-border/50 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center">
          <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></span>
          SOC Environment
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border-border/60 bg-popover/95 backdrop-blur-md p-2">
            <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold text-foreground px-2 py-1.5">
              <span>Security Notifications</span>
              {alertCount > 0 && (
                <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  {alertCount} Active
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No active notifications
              </div>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {alerts.map((alert: any) => (
                  <DropdownMenuItem key={alert.id} asChild>
                    <Link
                      to="/dashboard/alerts"
                      className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground truncate">{alert.title}</span>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                        <span>IP: {alert.source_ip || "Internal"}</span>
                        <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/alerts"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 py-2 cursor-pointer w-full text-center"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>View All Security Alerts</span>
                <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-2"></div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline-block">{user ? user.username : "Analyst"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </div>
  );
}
