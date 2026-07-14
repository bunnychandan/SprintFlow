"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: "TASK", label: "Task" },
  { value: "BUG", label: "Bug" },
  { value: "STORY", label: "Story" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "QA_TESTING", label: "QA Testing" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "DONE", label: "Done" },
  { value: "REOPENED", label: "Reopened" },
];

const PRIORITY_OPTIONS = [
  { value: "LOWEST", label: "Lowest" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "HIGHEST", label: "Highest" },
  { value: "CRITICAL", label: "Critical" },
];

export default function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("TASK");
  const [originalEstimate, setOriginalEstimate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [members, setMembers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetch("/api/projects/" + projectId + "/members")
        .then((r) => r.ok && r.json())
        .then((d) => setMembers(d.members || []))
        .catch(() => {});
      fetch("/api/projects/" + projectId + "/sprints")
        .then((r) => r.ok && r.json())
        .then((d) => setSprints(d.sprints || []))
        .catch(() => {});
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!title.trim()) {
      setError("Task title is required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          type,
          originalEstimate: originalEstimate ? Number(originalEstimate) : null,
          assigneeId: assigneeId || null,
          sprintId: sprintId || null,
          storyPoints: storyPoints ? Number(storyPoints) : null,
          dueDate: dueDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create task");
      }

      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setType("TASK");
      setOriginalEstimate("");
      setAssigneeId("");
      setSprintId("");
      setStoryPoints("");
      setDueDate("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const memberOptions = members.map((m: any) => ({
    value: m.user.id,
    label: `${m.user.name} (${m.roleInProject})`,
  }));

  const sprintOptions = sprints
    .filter((s: any) => s.status !== "COMPLETED")
    .map((s: any) => ({
      value: s.id,
      label: `${s.name} (${s.status})`,
    }));

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Task Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_OPTIONS}
        />
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement OAuth Sign-in"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the details, criteria, etc."
          rows={3}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={PRIORITY_OPTIONS}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            placeholder="Unassigned"
            options={memberOptions}
          />
          <Select
            label="Sprint"
            value={sprintId}
            onChange={(e) => setSprintId(e.target.value)}
            placeholder="Backlog"
            options={sprintOptions}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Story Points"
            type="number"
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
            placeholder="e.g. 5"
            min={0}
          />
          <Input
            label="Original Estimate (hours)"
            type="number"
            value={originalEstimate}
            onChange={(e) => setOriginalEstimate(e.target.value)}
            placeholder="e.g. 40"
            min={0}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
