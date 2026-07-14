"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { ResourceAllocationPanel } from "@/components/resources/resource-allocation-panel";
import { CapacityChart } from "@/components/resources/capacity-chart";
import { UtilizationChart } from "@/components/resources/utilization-chart";
import { WorkloadChart } from "@/components/resources/workload-chart";
import { ResourceCalendar } from "@/components/resources/resource-calendar";
import { TimesheetTable } from "@/components/resources/timesheet-table";
import { ResourceReportTable } from "@/components/resources/resource-report-table";
import { ResourceEmptyState } from "@/components/resources/resource-empty-state";
import { useResource, useWorkload, useCapacity, useCalendar, useTimesheet, useResourceReports } from "@/hooks/use-resources";
import { Briefcase, Building2, Mail } from "lucide-react";

type Tab = "overview" | "workload" | "capacity" | "calendar" | "timesheets" | "reports";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "workload", label: "Workload" },
  { key: "capacity", label: "Capacity" },
  { key: "calendar", label: "Calendar" },
  { key: "timesheets", label: "Timesheets" },
  { key: "reports", label: "Reports" },
];

export default function ResourceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: resource, loading } = useResource(id);
  const { data: workload } = useWorkload();
  const { data: capacity } = useCapacity();
  const { data: calendarEvents } = useCalendar({ userId: id });
  const { data: timesheets } = useTimesheet(id);
  const { data: reports } = useResourceReports();

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-surface-hover" />
          <div className="h-48 rounded-2xl bg-surface-hover" />
        </div>
      </main>
    );
  }

  if (!resource) return <ResourceEmptyState title="Resource Not Found" description="The requested resource could not be found." />;

  const userWorkload = workload.find((w) => w.userId === id);
  const userCapacity = capacity.find((c) => c.userId === id);

  const tabContent: Record<Tab, React.ReactNode> = {
    overview: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Tasks", value: userWorkload?.totalTasks || 0 },
                { label: "In Progress", value: userWorkload?.inProgressTasks || 0 },
                { label: "Completed", value: userWorkload?.completedTasks || 0 },
                { label: "Overdue", value: userWorkload?.overdueTasks || 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs text-foreground-muted">{s.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            <WorkloadChart data={userWorkload ? [userWorkload] : []} />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={resource.image} name={resource.name || resource.email} className="h-12 w-12" />
                <div>
                  <p className="text-base font-semibold text-foreground">{resource.name || resource.email}</p>
                  <p className="text-xs text-foreground-muted">{resource.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {resource.designation && (
                  <div className="flex items-center gap-2 text-foreground-secondary"><Briefcase className="h-4 w-4" />{resource.designation}</div>
                )}
                {resource.department && (
                  <div className="flex items-center gap-2 text-foreground-secondary"><Building2 className="h-4 w-4" />{resource.department}</div>
                )}
                <div className="flex items-center gap-2 text-foreground-secondary"><Mail className="h-4 w-4" />{resource.email}</div>
              </div>
              <div className="mt-4"><RoleBadge role={resource.role} /></div>
            </div>
            <ResourceAllocationPanel allocations={resource.allocations} />
          </div>
        </div>
      </div>
    ),
    workload: (
      <div className="space-y-6">
        <WorkloadChart data={workload} />
      </div>
    ),
    capacity: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CapacityChart data={userCapacity ? [userCapacity] : []} />
          <UtilizationChart data={userCapacity ? [userCapacity] : []} />
        </div>
      </div>
    ),
    calendar: (
      <div className="space-y-6">
        <ResourceCalendar events={calendarEvents} />
      </div>
    ),
    timesheets: (
      <div className="space-y-6">
        <TimesheetTable data={timesheets} />
      </div>
    ),
    reports: (
      <div className="space-y-6">
        <ResourceReportTable data={reports} />
      </div>
    ),
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <header className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar src={resource.image} name={resource.name || resource.email} className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{resource.name || resource.email}</h1>
            <p className="text-sm text-foreground-secondary">{resource.designation || resource.department || "Team Member"}</p>
          </div>
        </div>
      </header>

      <div className="border-b border-border mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tabContent[activeTab]}
    </main>
  );
}
