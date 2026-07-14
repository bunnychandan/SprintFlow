"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, UserPlus } from "lucide-react";
import { Button, Card, Avatar, RoleBadge, Input, Select, EmptyState } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";

interface MembersTabProps {
  project: any;
  onRefresh: () => void;
}

const PROJECT_ROLES = [
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "SCRUM_MASTER", label: "Scrum Master" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "TESTER", label: "Tester" },
  { value: "BUSINESS_ANALYST", label: "Business Analyst" },
  { value: "VIEWER", label: "Viewer" },
];

export default function MembersTab({ project, onRefresh }: MembersTabProps) {
  const { addToast } = useToast();
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("DEVELOPER");
  const [isAdding, setIsAdding] = useState(false);

  const isManager =
    project.ownerId === project.currentUserId ||
    ["SUPER_ADMIN", "ADMIN"].includes(project.currentUserRole || "") ||
    ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(project.currentUserProjectRole || "");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail.trim(), role: memberRole }),
      });
      if (res.ok) {
        addToast({ message: "Member added successfully.", type: "success" });
        setMemberEmail("");
        onRefresh();
      } else {
        const data = await res.json();
        addToast({ message: data.error ?? "Failed to add member.", type: "error" });
      }
    } catch {
      addToast({ message: "Failed to add member.", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/members?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast({ message: "Member removed successfully.", type: "success" });
        onRefresh();
      }
    } catch {
      addToast({ message: "Failed to remove member.", type: "error" });
    }
  };

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[1.2fr_0.8fr] gap-6 overflow-hidden min-h-0">
      <Card variant="glass" className="overflow-y-auto pr-1 min-h-0">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Project Team Roster ({(project.members || []).length})
        </h3>
        {(project.members || []).length === 0 ? (
          <EmptyState
            title="No members"
            description="This project has no members yet."
          />
        ) : (
          <div className="divide-y divide-border">
            {(project.members || []).map((m: any) => {
              const isOwner = m.userId === project.ownerId;
              const showRemove = isManager && !isOwner && m.userId !== project.currentUserId;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <Avatar src={m.user.image} name={m.user.name} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {m.user.name}
                        {isOwner && (
                          <span className="ml-1.5 text-[10px] text-accent font-normal">(Owner)</span>
                        )}
                      </p>
                      <p className="text-xs text-foreground-muted truncate">
                        {m.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <RoleBadge role={isOwner ? "PROJECT_MANAGER" : m.roleInProject} />
                    {showRemove && (
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        className="text-foreground-muted hover:text-destructive transition-colors p-1"
                        aria-label={`Remove ${m.user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {isManager ? (
          <Card variant="glass">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-accent" />
              Assign Member to Project
            </h3>
            <p className="text-xs text-foreground-secondary mt-1">
              Assign a user record by email and designate their role within this project.
            </p>
            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="collaborator@company.com"
              />
              <Select
                label="Project Role"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                options={PROJECT_ROLES}
              />
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                isLoading={isAdding}
              >
                Assign member
              </Button>
            </form>
          </Card>
        ) : (
          <Card variant="glass" className="text-center">
            <p className="text-foreground-muted text-sm">
              You have read-only access to the project team roster. Contact
              project managers to modify.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
