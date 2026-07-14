"use client";

import { useState } from "react";
import { Dialog, Button, Input, Select, Textarea } from "@/components/ui";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private (Assigned Members Only)" },
  { value: "TEAM", label: "Team (Accessible to Organization)" },
  { value: "PUBLIC", label: "Public (Visible to All Logged In)" },
];

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name.trim()) {
      setError("Project name is required");
      setIsLoading(false);
      return;
    }
    if (!code.trim() || code.length < 2) {
      setError("Project code is required and must be at least 2 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          visibility,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create project");
      }

      setName("");
      setCode("");
      setDescription("");
      setVisibility("PRIVATE");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!code) {
              const words = e.target.value.split(" ");
              let generatedCode = "";
              if (words.length >= 2) {
                generatedCode = words
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 4);
              } else if (words.length === 1 && words[0].length >= 3) {
                generatedCode = words[0].slice(0, 3);
              }
              setCode(generatedCode.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            }
          }}
          placeholder="e.g. Platform Release"
        />
        <Input
          label="Project Key / Code"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
          }
          maxLength={6}
          placeholder="e.g. PLAT"
          helperText="Short prefix key for issues (e.g. PLAT-101)"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the scope of the project..."
          rows={3}
        />
        <Select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          options={VISIBILITY_OPTIONS}
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" type="submit" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
