import { IntegrationDetailView } from "@/components/integrations/integration-detail";

export default function IntegrationDetailPage({ params }: { params: { id: string } }) {
  return <IntegrationDetailView id={params.id} />;
}
