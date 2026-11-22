import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, ShieldAlert, Activity, ShieldHalf, LayoutList, Settings, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { name: "Detection Rules", href: "/dashboard/rules", icon: ShieldAlert },
  { name: "Rule Analytics", href: "/dashboard/analytics", icon: Activity },
  { name: "Attack Chains", href: "/dashboard/analytics/attack-chains", icon: Link2 },
  { name: "Threat Hunting", href: "/dashboard/hunting", icon: ShieldHalf },
  { name: "Incidents", href: "/dashboard/incidents", icon: LayoutList },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6 py-4 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary mr-3">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground font-heading">SentriX</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href + "/") &&
                !navigation.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.length > item.href.length &&
                    (location.pathname === other.href || location.pathname.startsWith(other.href + "/"))
                ));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("mr-3 h-4 w-4 flex-shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
