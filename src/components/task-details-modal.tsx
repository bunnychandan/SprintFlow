"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  User,
  Trash2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  Button,
  Input,
  Select,
  Textarea,
  Avatar,
  ConfirmDialog,
} from "@/components/ui";
import { useToast } from "@/contexts/toast-context";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
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

export default function TaskDetailsModal({
  isOpen,
  onClose,
  taskId,
  projectId,
  onSuccess,
}: TaskDetailsModalProps) {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("TASK");
  const [originalEstimate, setOriginalEstimate] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const fetchTaskDetails = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setTitle(data.task.title);
        setDescription(data.task.description || "");
        setStatus(data.task.status);
        setPriority(data.task.priority);
        setType(data.task.type || "TASK");
        setOriginalEstimate(data.task.originalEstimate?.toString() || "");
        setTimeSpent(data.task.timeSpent?.toString() || "");
        setTimeRemaining(data.task.timeRemaining?.toString() || "");
        setAssigneeId(data.task.assigneeId || "");
        setSprintId(data.task.sprintId || "");
        setStoryPoints(data.task.storyPoints?.toString() || "");
        setDueDate(
          data.task.dueDate
            ? new Date(data.task.dueDate).toISOString().split("T")[0]
            : ""
        );
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
      fetch("/api/projects/" + projectId + "/members")
        .then((r) => r.ok && r.json())
        .then((d) => setMembers(d.members || []))
        .catch(() => {});
      fetch("/api/projects/" + projectId + "/sprints")
        .then((r) => r.ok && r.json())
        .then((d) => setSprints(d.sprints || []))
        .catch(() => {});
    }
  }, [isOpen, taskId, projectId, fetchTaskDetails]);

  const handleUpdateField = async (fieldName: string, value: any) => {
    try {
      setError("");
      const payload: any = {};
      payload[fieldName] = value === "" ? null : value;
      if (
        ["storyPoints", "originalEstimate", "timeSpent", "timeRemaining"].includes(
          fieldName
        ) &&
        value !== ""
      ) {
        payload[fieldName] = Number(value);
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }

      fetchTaskDetails();
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Update failed");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        fetchTaskDetails();
      }
    } catch {
      // silently fail
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTaskDetails();
    } catch {
      // silently fail
    }
  };

  const handleDeleteTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        addToast({ message: "Task deleted.", type: "success" });
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        addToast({ message: data.error ?? "Failed to delete.", type: "error" });
      }
    } catch {
      addToast({ message: "Failed to delete task.", type: "error" });
    }
    setShowDeleteConfirm(false);
  };

  const memberOptions = members.map((m: any) => ({
    value: m.user.id,
    label: m.user.name,
  }));

  const sprintOptions = sprints.map((s: any) => ({
    value: s.id,
    label: `${s.name} (${s.status})`,
  }));

  if (!task) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
        <div className="flex items-center justify-center py-12 text-foreground-muted">
          Loading task details...
        </div>
      </Dialog>
    );
  }

  const spent = Number(timeSpent) || 0;
  const remaining = Number(timeRemaining) || 0;
  const estimate = Number(originalEstimate) || 0;
  const total = spent + remaining || estimate || 0;
  const spentPct = total ? Math.round((spent / total) * 100) : 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Task Details - ${task.project?.code || ""}-${task.id
        .slice(-4)
        .toUpperCase()}`}
      size="xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div>
            <Select
              label="Issue Type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                handleUpdateField("type", e.target.value);
              }}
              options={TYPE_OPTIONS}
            />
          </div>

          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleUpdateField("title", title)}
              className="w-full text-xl font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none py-1 text-foreground"
            />
          </div>

          <div>
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleUpdateField("description", description)}
              placeholder="Add a detailed description..."
              rows={4}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              Comments ({(task.comments || []).length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {(task.comments || []).map((comment: any) => {
                const canDelete =
                  comment.authorId === session?.user?.id ||
                  ["SUPER_ADMIN", "ADMIN"].includes(session?.user?.role || "");

                return (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-border bg-surface p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={comment.author.image}
                          name={comment.author.name}
                          size="sm"
                          className="h-6 w-6"
                        />
                        <span className="font-semibold text-foreground text-xs">
                          {comment.author.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-foreground-muted hover:text-destructive transition-colors"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-foreground-secondary pl-8">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
              />
              <Button variant="primary" size="sm" type="submit">
                Comment
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
          <h3 className="text-md font-semibold text-foreground">Attributes</h3>

          {error && <p className="text-destructive text-xs">{error}</p>}

          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              handleUpdateField("status", e.target.value);
            }}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              handleUpdateField("priority", e.target.value);
            }}
            options={PRIORITY_OPTIONS}
          />
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => {
              setAssigneeId(e.target.value);
              handleUpdateField("assigneeId", e.target.value);
            }}
            placeholder="Unassigned"
            options={memberOptions}
          />
          <Select
            label="Sprint"
            value={sprintId}
            onChange={(e) => {
              setSprintId(e.target.value);
              handleUpdateField("sprintId", e.target.value);
            }}
            placeholder="Backlog"
            options={sprintOptions}
          />
          <Input
            label="Story Points"
            type="number"
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
            onBlur={() => handleUpdateField("storyPoints", storyPoints)}
            placeholder="Unestimated"
            min={0}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={() => handleUpdateField("dueDate", dueDate)}
          />

          <div className="pt-4 border-t border-border space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Time Tracking
            </h4>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300 rounded-full"
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-foreground-muted font-medium">
                <span>{spent}h logged</span>
                <span>{remaining}h remaining</span>
              </div>
            </div>

            <div className="grid gap-2 grid-cols-3">
              <Input
                label="Estimate"
                type="number"
                value={originalEstimate}
                onChange={(e) => setOriginalEstimate(e.target.value)}
                onBlur={() => {
                  handleUpdateField("originalEstimate", originalEstimate);
                  if (!timeRemaining && originalEstimate) {
                    setTimeRemaining(originalEstimate);
                    handleUpdateField("timeRemaining", originalEstimate);
                  }
                }}
                placeholder="h"
                min={0}
              />
              <Input
                label="Logged"
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                onBlur={() => {
                  handleUpdateField("timeSpent", timeSpent);
                  if (originalEstimate && timeSpent !== "") {
                    const est = Number(originalEstimate);
                    const sp = Number(timeSpent);
                    const rem = Math.max(0, est - sp);
                    setTimeRemaining(rem.toString());
                    handleUpdateField("timeRemaining", rem);
                  }
                }}
                placeholder="h"
                min={0}
              />
              <Input
                label="Remaining"
                type="number"
                value={timeRemaining}
                onChange={(e) => setTimeRemaining(e.target.value)}
                onBlur={() => handleUpdateField("timeRemaining", timeRemaining)}
                placeholder="h"
                min={0}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-1 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Reporter: {task.reporter?.name}
            </span>
          </div>

          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete Task
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete Task"
        variant="danger"
      />
    </Dialog>
  );
}
