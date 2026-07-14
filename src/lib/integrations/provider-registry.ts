import type { IntegrationProviderInterface } from "./provider";
import { GitHubProvider } from "./github";
import { GitLabProvider } from "./gitlab";
import { SlackProvider } from "./slack";
import { MicrosoftTeamsProvider } from "./microsoft-teams";
import { GoogleCalendarProvider } from "./google-calendar";
import { OutlookProvider } from "./outlook";
import { ZoomProvider } from "./zoom";
import { GoogleMeetProvider } from "./google-meet";
import { JenkinsProvider } from "./jenkins";
import { ArgoCDProvider } from "./argocd";
import type { IntegrationProvider } from "@/types/integrations";

const registry = new Map<string, IntegrationProviderInterface>();

export function registerIntegrationProvider(key: string, provider: IntegrationProviderInterface) {
  registry.set(key, provider);
}

export function getIntegrationProvider(key: string): IntegrationProviderInterface {
  const provider = registry.get(key);
  if (!provider) throw new Error(`Integration provider "${key}" not found`);
  return provider;
}

export function getAvailableIntegrationProviders(): IntegrationProviderInterface[] {
  return Array.from(registry.values());
}

registerIntegrationProvider("GITHUB", new GitHubProvider());
registerIntegrationProvider("GITLAB", new GitLabProvider());
registerIntegrationProvider("SLACK", new SlackProvider());
registerIntegrationProvider("MICROSOFT_TEAMS", new MicrosoftTeamsProvider());
registerIntegrationProvider("GOOGLE_CALENDAR", new GoogleCalendarProvider());
registerIntegrationProvider("OUTLOOK", new OutlookProvider());
registerIntegrationProvider("ZOOM", new ZoomProvider());
registerIntegrationProvider("GOOGLE_MEET", new GoogleMeetProvider());
registerIntegrationProvider("JENKINS", new JenkinsProvider());
registerIntegrationProvider("ARGOCD", new ArgoCDProvider());

export function getProviderForIntegration(provider: IntegrationProvider): IntegrationProviderInterface {
  return getIntegrationProvider(provider);
}
