"use client";

import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Select, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

interface NotificationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  readFilter: string;
  onReadChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  className?: string;
}

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "TASK_ASSIGNED", label: "Task Assigned" },
  { value: "TASK_UPDATED", label: "Task Updated" },
  { value: "TASK_COMPLETED", label: "Task Completed" },
  { value: "TASK_COMMENT", label: "Comment" },
  { value: "TASK_MENTION", label: "Mention" },
  { value: "SPRINT_STARTED", label: "Sprint Started" },
  { value: "SPRINT_COMPLETED", label: "Sprint Completed" },
  { value: "PROJECT_CREATED", label: "Project Created" },
  { value: "PROJECT_UPDATED", label: "Project Updated" },
  { value: "PROJECT_ARCHIVED", label: "Project Archived" },
  { value: "USER_INVITED", label: "User Invited" },
  { value: "USER_JOINED", label: "User Joined" },
  { value: "ADMIN_CREATED", label: "Admin Created" },
  { value: "SYSTEM_ALERT", label: "System Alert" },
  { value: "AUDIT_WARNING", label: "Audit Warning" },
  { value: "SECURITY_EVENT", label: "Security Event" },
];

const priorityOptions = [
  { value: "", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const readOptions = [
  { value: "", label: "All" },
  { value: "false", label: "Unread" },
  { value: "true", label: "Read" },
];

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "priority", label: "Priority" },
  { value: "type", label: "Type" },
];

export function NotificationFilters({
  search, onSearchChange,
  typeFilter, onTypeChange,
  priorityFilter, onPriorityChange,
  readFilter, onReadChange,
  sortBy, onSortChange,
  className,
}: NotificationFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-3 items-end", className)}>
      <Input
        placeholder="Search notifications..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        className="max-w-xs"
      />
      <Select
        options={typeOptions}
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="max-w-[150px]"
        label="Type"
      />
      <Select
        options={priorityOptions}
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="max-w-[130px]"
        label="Priority"
      />
      <Select
        options={readOptions}
        value={readFilter}
        onChange={(e) => onReadChange(e.target.value)}
        className="max-w-[110px]"
        label="Status"
      />
      <Select
        options={sortOptions}
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="max-w-[120px]"
        label="Sort"
      />
    </div>
  );
}
