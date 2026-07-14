import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Globe, Shield, Database, HardDrive, Mail, KeyRound } from "lucide-react";

interface EnvironmentTableProps {
  environment: {
    nodeEnv: string;
    appVersion: string;
    buildVersion: string;
    gitCommit: string;
    deploymentEnv: string;
    providers: {
      database: string;
      storage: string;
      email: string;
      oauth: string;
    };
  };
  className?: string;
}

function MaskedValue({ value }: { value: string }) {
  return (
    <span className="text-foreground-secondary font-mono text-xs">
      {value === "Not Configured" ? (
        <span className="text-warning">{value}</span>
      ) : (
        value
      )}
    </span>
  );
}

export function EnvironmentTable({ environment, className }: EnvironmentTableProps) {
  const sections = [
    {
      title: "Environment",
      icon: Globe,
      items: [
        { label: "NODE_ENV", value: environment.nodeEnv },
        { label: "App Version", value: environment.appVersion },
        { label: "Build Version", value: environment.buildVersion },
        { label: "Git Commit", value: environment.gitCommit },
        { label: "Deployment", value: environment.deploymentEnv },
      ],
    },
    {
      title: "Providers",
      icon: Shield,
      items: [
        { label: "Database", value: environment.providers.database, icon: Database },
        { label: "Storage", value: environment.providers.storage, icon: HardDrive },
        { label: "Email", value: environment.providers.email, icon: Mail },
        { label: "OAuth", value: environment.providers.oauth, icon: KeyRound },
      ],
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {sections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <Card key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <SectionIcon className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const ItemIcon = (item as any).icon;
                return (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-xs text-foreground-secondary">
                      {(ItemIcon as React.ElementType) && <ItemIcon className="h-3.5 w-3.5 text-foreground-muted" />}
                      {item.label}
                    </span>
                    <MaskedValue value={item.value} />
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
