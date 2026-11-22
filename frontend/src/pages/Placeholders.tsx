import { PageHeader } from "@/components/ui-custom/PageHeader";



export function Alerts() {
  return (
    <div>
      <PageHeader title="Alerts" description="Manage and triage security alerts" />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <p className="text-muted-foreground">Alert list and details go here</p>
      </div>
    </div>
  );
}

export function Rules() {
  return (
    <div>
      <PageHeader title="Detection Rules" description="Configure and tune detection logic" />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <p className="text-muted-foreground">Detection rules CRUD goes here</p>
      </div>
    </div>
  );
}

export function Analytics() {
  return (
    <div>
      <PageHeader title="Rule Analytics" description="Performance and match metrics" />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <p className="text-muted-foreground">Analytics charts go here</p>
      </div>
    </div>
  );
}

export function Hunting() {
  return (
    <div>
      <PageHeader title="Threat Hunting" description="Proactive threat search and hypothesis" />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <p className="text-muted-foreground">Hunting interface goes here</p>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <PageHeader title="Settings" description="System configurations and preferences" />
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <p className="text-muted-foreground">Settings forms go here</p>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <p className="text-muted-foreground">Page not found</p>
    </div>
  );
}
