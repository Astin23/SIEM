import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "New" | "Acknowledged" | "Investigating" | "Resolved" | "Closed" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    New: "bg-blue-100 text-blue-800 border-blue-300",
    Acknowledged: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Investigating: "bg-purple-100 text-purple-800 border-purple-300",
    Resolved: "bg-green-100 text-green-800 border-green-300",
    Closed: "bg-gray-100 text-gray-800 border-gray-300",
    Active: "bg-red-100 text-red-800 border-red-300",
    Completed: "bg-indigo-100 text-indigo-800 border-indigo-300",
    Unavailable: "bg-zinc-100 text-zinc-600 border-zinc-300",
  };

  const badgeColor = colorMap[status] || colorMap.Unavailable;

  return (
    <Badge variant="outline" className={cn(badgeColor, className)}>
      {status}
    </Badge>
  );
}
