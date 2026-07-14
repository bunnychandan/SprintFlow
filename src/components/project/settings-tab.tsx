"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea, Card, ConfirmDialog } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";

interface SettingsTabProps {
  project: any;
  onRefresh: () => void;
}

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private (Assigned Members Only)" },
  { value: "TEAM", label: "Team (Accessible to Organization)" },
  { value: "PUBLIC", label: "Public (Visible to All Logged In)" },
];

export default function SettingsTab({ project, onRefresh }: SettingsTabProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [visibility, setVisibility] = useState(project.visibility);

  const isOwnerOrAdmin =
    project.ownerId === project.currentUserId ||
    ["SUPER_ADMIN", "ADMIN"].includes(project.currentUserRole || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, visibility }),
      });
      if (res.ok) {
        addToast({ message: "Project settings updated.", type: "success" });
        onRefresh();
      } else {
        const data = await res.json();
        addToast({ message: data.error ?? "Failed to update.", type: "error" });
      }
    } catch {
      addToast({ message: "Failed to update project.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({ message: "Project deleted.", type: "success" });
        router.push("/projects");
      }
    } catch {
      addToast({ message: "Failed to delete project.", type: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[1.2fr_0.8fr] gap-6 overflow-y-auto pr-1 min-h-0">
      <Card variant="glass" className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground">
          Project Configuration
        </h3>

        {isOwnerOrAdmin ? (
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <Select
              label="Visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={VISIBILITY_OPTIONS}
            />
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save configuration
            </Button>
          </form>
        ) : (
          <div className="space-y-3 text-sm text-foreground-secondary">
            <p>
              <strong className="text-foreground">Project Name:</strong>{" "}
              {project.name}
            </p>
            <p>
              <strong className="text-foreground">Key:</strong> {project.code}
            </p>
            <p>
              <strong className="text-foreground">Description:</strong>{" "}
              {project.description || "None"}
            </p>
            <p>
              <strong className="text-foreground">Visibility:</strong>{" "}
              {project.visibility}
            </p>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {isOwnerOrAdmin ? (
          <Card
            variant="default"
            className="border-destructive/20 bg-destructive/5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h3>
            <p className="text-xs text-foreground-secondary">
              Deleting the project is permanent and removes all associated
              sprints, issues, backlog, and activity logs.
            </p>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete project workspace
            </Button>
          </Card>
        ) : (
          <Card variant="glass" className="text-center">
            <p className="text-foreground-muted text-sm">
              Danger zone options are restricted to the project owner and
              administrators.
            </p>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        message={`This permanently deletes "${project.name}" and all associated data. This cannot be undone.`}
        confirmLabel="Delete Project"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
