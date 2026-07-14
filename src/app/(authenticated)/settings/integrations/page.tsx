import { IntegrationsList } from "@/components/integrations/integrations-list";
import { IntegrationsDashboard } from "@/components/integrations/integrations-dashboard";

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <IntegrationsDashboard />
      <IntegrationsList />
    </div>
  );
}
