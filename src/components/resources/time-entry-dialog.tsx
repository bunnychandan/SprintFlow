"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { taskId: string; description?: string; timeSpent: number; billable: boolean; loggedAt: string }) => void;
  loading?: boolean;
}

export function TimeEntryDialog({ isOpen, onClose, onSubmit, loading }: TimeEntryDialogProps) {
  const [taskId, setTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [timeSpent, setTimeSpent] = useState("1");
  const [billable, setBillable] = useState("true");
  const [loggedAt, setLoggedAt] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    if (!taskId || !timeSpent || !loggedAt) return;
    onSubmit({
      taskId,
      description: description || undefined,
      timeSpent: parseInt(timeSpent, 10),
      billable: billable === "true",
      loggedAt,
    });
    setTaskId("");
    setDescription("");
    setTimeSpent("1");
    setLoggedAt(new Date().toISOString().split("T")[0]);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log Time" size="sm">
      <div className="space-y-4">
        <Input label="Task ID" value={taskId} onChange={(e) => setTaskId(e.target.value)} placeholder="Enter task ID" required />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you work on?" />
        <Input label="Hours" type="number" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} min="0.5" max="24" step="0.5" required />
        <Input label="Date" type="date" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} required />
        <Select
          label="Type"
          value={billable}
          onChange={(e) => setBillable(e.target.value)}
          options={[{ value: "true", label: "Billable" }, { value: "false", label: "Non-Billable" }]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" size="sm" leftIcon={<Clock className="h-4 w-4" />} onClick={handleSubmit} isLoading={loading}>
            Log Time
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
