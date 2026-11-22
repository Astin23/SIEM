import { format } from "date-fns";
import type { DetectionRule } from "@/api/rules";
import { Edit, Trash2, Power, PowerOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RulesTableProps {
  rules: DetectionRule[];
  onEdit: (rule: DetectionRule) => void;
  onDelete: (rule: DetectionRule) => void;
  onToggleStatus: (rule: DetectionRule) => void;
  isTogglingId?: string | number | null;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground ring-destructive",
    high: "bg-warning text-warning-foreground ring-warning",
    medium: "bg-info text-info-foreground ring-info",
    low: "bg-success text-success-foreground ring-success",
  };
  return (
    <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ring-1 ring-inset ${map[severity?.toLowerCase()] || "bg-muted text-muted-foreground ring-border"}`}>
      {severity}
    </span>
  );
}

export function RulesTable({ rules, onEdit, onDelete, onToggleStatus, isTogglingId }: RulesTableProps) {
  if (!rules || rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border/50 shadow-sm text-muted-foreground">
        <ShieldAlert className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-foreground">No Detection Rules Found</h3>
        <p className="text-sm mt-1 max-w-md text-center">
          Try adjusting your search or filters, or create a new detection rule to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Rule Name</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Severity</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Updated</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rules.map((rule) => (
              <tr 
                key={rule.id} 
                className="bg-card hover:bg-muted/20 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground font-heading">{rule.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-xs" title={rule.description}>
                    {rule.description || "No description"}
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {rule.category || "-"}
                </td>
                <td className="px-6 py-4">
                  <SeverityBadge severity={rule.severity} />
                </td>
                <td className="px-6 py-4 font-medium text-muted-foreground">
                  {rule.priority}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${rule.enabled ? 'bg-success/10 text-success ring-success/30' : 'bg-muted text-muted-foreground ring-border/50'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${rule.enabled ? 'bg-success' : 'bg-muted-foreground'}`}></span>
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(rule.updated_at), "MMM d, HH:mm")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      title={rule.enabled ? "Disable Rule" : "Enable Rule"}
                      onClick={() => onToggleStatus(rule)}
                      disabled={isTogglingId === rule.id}
                    >
                      {rule.enabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4 text-success" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Edit Rule"
                      onClick={() => onEdit(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete Rule"
                      onClick={() => onDelete(rule)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
