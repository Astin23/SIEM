import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational" | string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const colorMap: Record<string, string> = {
    Critical: "bg-red-600 hover:bg-red-700 text-white",
    High: "bg-orange-500 hover:bg-orange-600 text-white",
    Medium: "bg-yellow-500 hover:bg-yellow-600 text-white",
    Low: "bg-blue-500 hover:bg-blue-600 text-white",
    Informational: "bg-gray-500 hover:bg-gray-600 text-white",
  };

  const badgeColor = colorMap[severity] || colorMap.Informational;

  return (
    <Badge className={cn(badgeColor, className)}>
      {severity}
    </Badge>
  );
}
