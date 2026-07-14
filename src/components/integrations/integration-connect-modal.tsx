"use client";

import { useState } from "react";
import { createIntegrationSchema } from "@/lib/integrations/validations";
import { getAvailableIntegrationProviders } from "@/lib/integrations/provider-registry";
import { useCreateIntegration } from "@/hooks/integrations";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { IntegrationProvider } from "@/types/integrations";
import { Loader2 } from "lucide-react";

const providers = getAvailableIntegrationProviders();

export function IntegrationConnectModal({ isOpen, onClose, orgId }: { isOpen: boolean; onClose: () => void; orgId: string }) {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const createMutation = useCreateIntegration(orgId);

  const provider = providers.find((p) => p.provider === selectedProvider);
  const configSchema = provider?.getConfigurationSchema() || {};

  const handleSelect = (providerKey: string) => {
    setSelectedProvider(providerKey);
    setStep("configure");
  };

  const handleSubmit = async () => {
    setError("");
    const configuration: Record<string, unknown> = {};
    for (const [key] of Object.entries(configSchema)) {
      if (configValues[key]) configuration[key] = configValues[key];
    }
    const payload = { name: name || provider?.name || "", provider: selectedProvider as IntegrationProvider, type: provider?.type as any, description: description || null, configuration };
    const parsed = createIntegrationSchema.safeParse(payload);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "Validation error"); return; }
    try {
      await createMutation.mutateAsync(payload);
      onClose();
      reset();
    } catch (e: any) { setError(e.message); }
  };

  const reset = () => { setStep("select"); setSelectedProvider(""); setName(""); setDescription(""); setConfigValues({}); setError(""); };

  return (
    <Dialog isOpen={isOpen} onClose={() => { onClose(); reset(); }} title={step === "select" ? "Select Integration" : `Configure ${provider?.name}`} size="lg">
      {step === "select" ? (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {providers.map((p) => (
            <button key={p.provider} onClick={() => handleSelect(p.provider)} className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:bg-accent text-left transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">{p.provider.slice(0, 2)}</div>
              <div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.description}</p></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div><label className="block text-xs font-medium mb-1">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={provider?.name || "Integration name"} /></div>
          <div><label className="block text-xs font-medium mb-1">Description (optional)</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this integration for?" /></div>
          {Object.entries(configSchema).map(([key, field]: [string, any]) => (
            <div key={key}><label className="block text-xs font-medium mb-1">{field.label}{field.required && " *"}</label><Input type={field.type === "password" ? "password" : "text"} value={configValues[key] || ""} onChange={(e) => setConfigValues((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={field.placeholder || ""} /></div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Connect</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
